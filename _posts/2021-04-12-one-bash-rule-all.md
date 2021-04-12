---
layout: post
title: One bash script to rule them all!
date: 2021-04-08 09:00:00 +0100
description: We will see how one bash script can serve multiple purposes in a development project
img: posts/2021-04-12-one-bash-rule-all/cover.png
fig-caption: 
tags: [Bash, DevOps, Makefile, CI/CD]
guid: b296bb82-64e7-468f-823a-13bf941c3e12
---
This post is part of a [larger series of posts](http://toto) that we wrote with my team to share a full Data Science project experience we did during the last few months. In this article we will cover an approach to structure any project where bash files can serve multiples purposes without code duplication.


# Engineering fundamentals

For any development projects we are building, we need rules to set baseline of engineering best practices. What we will cover here everything related to code quality and ensuring these checks are done at the right time in the process.

# What does "code quality" mean?

Code quality can be very subjective based on developers, their experience and their knowledge in the technology used. However, I can see 3 areas where subjectivity can be by passed - and these checks are usually automatic:

* Unit tests
* Code coverage of these unit tests
* Linting

Although the 2 first one are pretty obvious, the last one can be tricker. Here is a difinition of *linting* from [Wikipedia](https://en.wikipedia.org/wiki/Lint_(software))

>lint, or a linter, is a static code analysis tool used to flag programming errors, bugs, stylistic errors, and suspicious constructs The term originates from a Unix utility that examined C language source code.

And finally, for the "more" subjective approach, *code review* is also a very important step in process. This step is, unlike the others, a manual step as code is reviewed by another Software Engineer.

# When do we need to run those checks?

## Continous integration

In our whole development life cycle, the most important moment where these checks need to run is during our *Continous Integration*. One of the core engineering best practice is to have a common source control repository, such as Git (either on the [cloud](https://www.github.com) or on-prem) or [Azure DevOps](https://azure.microsoft.com/en-us/services/devops/)

For the rest of the this post I will assume that you are comfortable with pull request. A high level definition from [Wikipedia](https://en.wikipedia.org/wiki/Git) would be

> A pull request is a request by one user to merge a branch of their repository fork into another repository sharing the same history 

So, as a developer, I create a PR (pull request) to merge my code to an upstream branch. That means that "my code" will move from my local development environment to the remote one. Hmm, I think it is a good moment to run those automatic checks :)

This is where the *Continuous Integration* (CI) practice of DevOps will be used. By creating a PR, a CI pipeline starts (or *Action* if you're using Github) - and this pipeline executes the automatic tests we've seen above. If one of them fails, the PR fails, and the developer needs to fix the issue and re-submit a PR.

If the PR validation passes, another developer needs to "approve" it manually. This is the *code review* part (and of course, all of this is not mandatory, these are just settings and policies to activate).

As soon as the peer approves the PR, the code is merged to the targeted branch.

## How to ensure that these tests pass before creating the PR

As a developer, I want to make sure that these tests are ok before submitting my PR. Depending on the technology, I can run unit tests on a terminal:

```sh
# For dotnetcore project
/> dotnet test MyProject

# For Python project
/> pytest $PATH

# etc ...
```

The commands above will only run tests - what about code coverage or linting checks. These are other commands.

So yes, I could write a *bash* file to execute all these commands - but would I commit it in the repo for all developers, or would I keep it for myself? And would I ensure that the options uses are the same that my CI will use?

This is where, without quoting a famous movie, we could have "one bash file to rule them all"!

Let's see how to implement it!

# Real life exemple

As mentionned, this post is a return of exeprience of a Data Science project where the technology used was Python - so for code snippets I will write below, I will use Python!

## Prerequisites

In [another post](http://todo) of this serie, we have seen how to use *Dev Containers* to ensure that everyone is using the same environment. That means that this container can already comply with Python dependencies required for these automatic tests:

```yaml
pytest==6.2.2
pytest-cov==2.11.1
flake8==3.8.4
```

*pytest* and *pytest-cov* will be used to handle unit tests and code coverage, while *flake8* will be used as a linter check.

If you are not using Linux-based Dev Containers, the following can only work on *nix system: [WSL 2 on Windows](https://docs.microsoft.com/en-us/windows/wsl/install-win10), MacOs or any Linux distribution.

## Overall architecture

Here is below a simple Python project:

![Project strcuture]({{site.baseurl}}/assets/img/posts/2021-04-12-one-bash-rule-all/project-structure.png)

It is a highly advanced calculator, with one function *add* in *operations.py*

```python
def add(x: int, y: int) -> int:
    """
    Adds two integers and returns the sum.
    """
    return x + y
```

Under folder *tests*, we can find one test for this function

```python
from Calculator import add

def test_add_ok():
    assert add(2, 3) == 5
```

If I want to lunch this test, I can type in a terminal:

```sh
pytest tests/
```

This will output my test result.

![Output Pytest no coverage]({{site.baseurl}}/assets/img/posts/2021-04-12-one-bash-rule-all/output-pytest-1.png)

However, I cannot see the percentage of code covered by this function. To have this information, my command must become

```sh
pytest tests/ --cov Calculator --cov-report term
```

![Output Pytest with coverage]({{site.baseurl}}/assets/img/posts/2021-04-12-one-bash-rule-all/output-pytest-2.png)

And of course, in order for a CI pipeline (or Github Action) to pick up these outputs, we will have to write in the pipeline the following command:

```sh
pytest tests/ --doctest-modules \
        --junitxml=pytest-results.xml \
        --cov=Calculator \
        --cov-report=xml
```

And we can see here that the call to Pytest is almost the same whether it runs "locally" or in the CI Pipeline

## One bash to rule them all

In order to simplify developers' life while ensuring code quality is met, we will create instead a simple bash file in our project - under *utils/* folder, called *test.sh* This file will be committed and will be part of the code available to all:

```sh
set -e
repoRoot="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"

pytest "$repoRoot"/tests --doctest-modules \
        --junitxml=pytest-results.xml \
        --cov="$repoRoot"/Calculator \
        --cov-report=xml --cov-report=term
```

The only difference is that we generate *repoRoot* to ensure the correctness of the Path whether we are locally or on a DevOps agent (the container that executes the CI pipeline or Github action)

With this approach, the same piece of code can be used by developers on their local environment

```sh
./utils/test.sh
```

But also, the pipeline itself can call that script! Below, here is a *basic* CI pipeline for Azure DevOps that calls this script:

```yaml
trigger:
  branches:
    include:
    - "master"
  paths:
    include:
    - src/*
    - tests/*

pool:
  vmImage: 'ubuntu-18.04'

steps:
- bash: |
    set -e
    utils/test.sh
  workingDirectory: $(Build.SourcesDirectory)
  displayName: Python Pytest

- task: PublishCodeCoverageResults@1
  inputs:
    codeCoverageTool: 'Cobertura'
    summaryFileLocation: '$(Build.SourcesDirectory)/coverage.xml'
    pathToSources: '$(Build.SourcesDirectory)/Calculator'
    failIfCoverageEmpty: true

- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: '$(Build.SourcesDirectory)/pytest-results.xml' 
    failTaskOnFailedTests: true
```

As we can see above, the first task executes our bash, the second and third publish the test results and code coverage into the pipeline output

## Wait, you spoke about linting also

I did - and the approach is exactly the same!

Let's first create a *bash* file:

```sh
#!/bin/bash
# Execute flake8 linter
#
# executable
#

set -e
appDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../Calculator" >/dev/null 2>&1 && pwd )"
testsDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../tests" >/dev/null 2>&1 && pwd )"

python -m flake8 --append-config=.flake8.cfg \
        --exclude .git,__pycache__, $appDir $testsDir
```

With this script, I can test both my application source folder *Calculator* and the *tests* folder:

![Output Flake8]({{site.baseurl}}/assets/img/posts/2021-04-12-one-bash-rule-all/output-flake8.png)

And by the way, I have 3 "flake8" errors ... that means my code cannot be pushed via PR :)

As we did for the unit tests, we can now call this script from the pipeline, and have both our linter and unit tests executed:

```yaml
(...)
- bash: |
    set -e
    utils/test.sh
    utils/linter.sh
  workingDirectory: $(Build.SourcesDirectory)
  displayName: Python Checks
(...)
```

## One more thing ...

As a developer, [I am lazy](https://www.forbes.com/sites/forbestechcouncil/2018/01/08/developers-are-lazy-and-thats-usually-a-good-thing/), that means that typing on my terminal

```sh
./utils/test.sh
```

even thought I have autocomplete annoyes me. 

This is where we can centralize all our actions into a [*Makefile*](https://en.wikipedia.org/wiki/Make_(software)). Well, we hijack a little bit the purpose of *make*, but still it is easier for developer to remember all of that.

Let's create a new file called *Makefile* at the root of our project

```makefile
SHELL=/bin/bash

# Run python linting validation
linter:
	. ./utils/linter.sh

# Run python tests
test:
	. ./utils/test.sh
```

Having that, I can simply run on my terminal

```sh
make test
# or
make linter
```

I can of course combine both actions

```makefile
SHELL=/bin/bash

# Run python linting validation
linter:
	. ./utils/linter.sh

# Run python tests
test:
	. ./utils/test.sh

check: linter test
```

and run

```sh
make checks
```

# In conclusion

If I sumarize what we have seen into a couple of take aways, I would say

1. Set rules and control with minimum constraints
2. Automate as much as you can
3. Onboard your developers with these tools and how to use them

If you are interested, I have put on [Github](https://github.com/jchomarat/one-bash-to-rule-them-all) this sample project that could serve as a baseline for any new Python-related project. Obviously, this logic could also be applied to other languages ...