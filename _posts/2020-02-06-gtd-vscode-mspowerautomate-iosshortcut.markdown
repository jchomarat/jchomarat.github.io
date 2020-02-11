---
layout: post
title: How Visual Studio Code, Microsoft Power Automate (ex. Flow) and iOS Shortcuts saved the day
date: 2020-02-11 10:00:00 +0100
description: Using a clean organization and a few tricks, you can now easily capture every thoughts that cross your mind
img: posts/2020-02-06-gtd-vscode-mspowerautomate-iosshortcut/cover.png
fig-caption: 
tags: [GTD, power automate, iOS, vscode]
guid: b296bb82-64e7-468f-823a-13bf941c3e08
---
In this article I will present an approach I have set up to make sure that all my notes, whether there are personal or related to my work, are centralized and accessible from any devices. I will also propose a way to make sure that my thoughts (that can come at any time) are captured and stored in the same repository.

# Why one needs a methodology

I am fully aware that what I will propose is intended to *me*, as we do not have all the same way of thinking or working. So first thing first is to know yourself. For instance, I have the memory of a goldfish, so I know that I need to write things down in order to not lose them. In addition, thoughts that are crossing my mind, most of time, come when I am doing something else. And of course, this can have an impact on the task I am currently doing. This is by the way part of the GTD (Get Things Done) methodology: we need to off-load our mind in order to remain efficient.

Having notes well organized, and processes to record everything is key.

At home I have a mac, and the tool I am using to store my notes is [nvalt](https://brettterpstra.com/projects/nvalt/). It is a simple, yet efficient, notes taking tool. However, this tool has, to me, two major problems:

1. It is only available on OSX
2. Notes are stored in [Simple Note](https://simplenote.com/) service, not as *flat files*

I have seen on [Github](https://github.com/) several initiatives to have nvalt *-like* tool ported on Windows - but, and my apologies to the developers who have worked on them, it is not as powerful and quick as [nvalt](https://brettterpstra.com/projects/nvalt/).

Notes in [nvalt](https://brettterpstra.com/projects/nvalt/) can be stored in [Simple Note](https://simplenote.com/), hence accessible from Windows using the [Simple Note](https://simplenote.com/) client. A client is also available in iOS & Android. Again, [Simple Note](https://simplenote.com/) is lacking the value [nvalt](https://brettterpstra.com/projects/nvalt/) is bringing.

I have plans to make my own tool, in Python with QT, that will be cross platform, but it takes time. So in the meantime I needed to come up with a solution.

# What are we going to do

This being said, I had to make trade-offs on my needs to achieve what I want.

Talking about needs, what do I need?

- [ ]  Text based notes tool (that can be markdown, but markdown is text-based)
- [ ] Search capabilities (notes file name & content search)
- [ ] Keyboards shortcut for quicker access to my content
- [ ] Accessible from Windows 10, OSX and iOS 
- [ ] Way to capture what crosses my mind, whether I am on my phone or on my computer
- [ ] Captured thoughts must be timestamped and stored in the same repository as my entire notes

To achieve all of that, we are going to use the following tools:

* [Visual Studio Code](https://code.visualstudio.com/), or vscode, a free IDE that supports markdown, available on both Windows & OSX (and even Linux, but I do not need that)
* [OneDrive](https://onedrive.live.com/), a cloud based storage
* [Microsoft Power Automate](https://preview.flow.microsoft.com/), the new name for Microsoft Flow, a web based application to build powerful workflow from multiple web services
* [iOS Shortcuts](https://apps.apple.com/us/app/shortcuts/id915249334), a powerful free application on iOS to build workflow that can interact with local applications

# How are we going to aggregate all of these tools

## First step: having a clean notes organization

The essential first step is to make sure that all of my notes are well organized. A note will be a markdown *file*, in folders / sub folders. This is typically something that will be different from one person to another. Some like n-dimensions folders, some other prefer everything flat. It is up to you to organize that.

These notes will be stored locally on my computer, under the [OneDrive](https://onedrive.live.com/) folder, or any other service. Again, it is up to you to decide in which cloud your notes will be stored. 

And finally, we will use vscode to interact with these notes. Here is how it looks like to me:

![Notes taking]({{site.baseurl}}/assets/img/posts/2020-02-06-gtd-vscode-mspowerautomate-iosshortcut/vscode-notes.png){:width="600px"}

Visual Studio code provides all the features built-in to navigate through files (**ctrl+p**), and to search within all the files (**ctrl+shift+f**). It also fully supports markdown, so you can organize your note with a color schema that makes it easy to read.

Based on my needs, where am I at so far?

- [x] Text based notes tool (that can be markdown, but markdown is text-based)
- [x] Search capabilities (notes file name & content search)
- [x] Keyboards shortcut for quicker access to my content
- [x] Accessible from Windows 10, OSX and iOS 
- [ ] Way to capture what crosses my mind, whether I am on my phone or on my computer
- [ ] Captured thoughts must be timestamped and stored in the same repository as my entire notes

## Second step: easily capture my thoughts

My notes are now organized the way I want. In the print screen above, in my notes list, there is one note called *inbox.md*. This note will actually receive all incoming captured thoughts. The idea behind the GTD methodology is to off-load your mind in an inbox (as new incoming mails) and your only duty is to go there and deal with them, whether it is a *to do* or a note. It is then up to you to handle tasks, there are tons of tools out there and again, you need to find the best way for *you* to handle tasks (including follow-up). For me, a simple text file, with the [todo.txt](http://todotxt.org/) syntax.

To capture my thoughts I will use both [Microsoft Power Automate](https://preview.flow.microsoft.com/) and [iOS Shortcuts](https://apps.apple.com/us/app/shortcuts/id915249334).

Why do I need Power Automate? The reason is that I will need to write in the file *inbox.md* stored on OneDrive, and from iOS Shortcut, it is not yet possible! So Power Automate will actually expose an endpoint (anonymous) and write incoming text into this file. It is then Power Automate's responsibility to keep my OneDrive credentials. iOS Shortcut will be the *front-end* on my Phone, easily accessible from the widgets.

![iOS Widgets]({{site.baseurl}}/assets/img/posts/2020-02-06-gtd-vscode-mspowerautomate-iosshortcut/ios-widgets.png){:width="400px"}

### Set up Power Automate

I strongly encourage to look at Power Automate, it is very powerful and allow tons of things. For my need, the configuration will be pretty simple:

![Power automate steps]({{site.baseurl}}/assets/img/posts/2020-02-06-gtd-vscode-mspowerautomate-iosshortcut/power-automate-steps.png){:width="600px"}

1 - The trigger is an incoming HTTP request

![Step 1]({{site.baseurl}}/assets/img/posts/2020-02-06-gtd-vscode-mspowerautomate-iosshortcut/power-automate-step-1.png){:width="400px"}

This HTTP request will be a POST, and the payload will have one property, *text*, with the actual captured text, sent by iOS Shortcuts

2 - Small hack to have carriage return

![Step 2]({{site.baseurl}}/assets/img/posts/2020-02-06-gtd-vscode-mspowerautomate-iosshortcut/power-automate-step-2.png){:width="400px"}

When my new thought will be appended to the file *inbox.md*, I want to have carriage return at the end of the file before adding the new content. I did not find a proper way to do it, so this hack will do ...

3 - Get the current timestamp

![Step 3]({{site.baseurl}}/assets/img/posts/2020-02-06-gtd-vscode-mspowerautomate-iosshortcut/power-automate-step-3.png){:width="600px"}

I instantiate a variable with the current formatted date and time. The expression to define is:

```sh
formatDateTime(utcNow(),'MMMM dd, yyyy HH:mm')
```

4 - Get the file *inbox.md* content

![Step 4]({{site.baseurl}}/assets/img/posts/2020-02-06-gtd-vscode-mspowerautomate-iosshortcut/power-automate-step-4.png){:width="400px"}

This step is the OneDrive connector. I need to register the OneDrive service first, then I can browse files and specify my file *inbox.md*, under the folder *notes*.

This step will actually load the file content so that I can edit the underlying string.

5 - Update the content and upload the edited file into OneDrive

![Step 5]({{site.baseurl}}/assets/img/posts/2020-02-06-gtd-vscode-mspowerautomate-iosshortcut/power-automate-step-5.png){:width="600px"}

This step does two things: append my new text and upload the new file. The expression used is:

```sh
concat(outputs('Get_file_content')?['body'], variables('CarriageReturn'), variables('CarriageReturn'), '# ', variables('ThoughtTitle'), variables('CarriageReturn'), triggerBody()?['text'])
```

**outputs('Get_file_content')?['body']** is the actual file content retrieved step 4.

**triggerBody()?['text']** is the text send to the Power Automate flow from iOS shortcut (this will be detailed right after).

Both **CarriageReturn** and **ThoughtTitle** are the variable defined steps 2 and 3.

### Set up iOS Shortcuts

Our *back-end* is now working. Let's work now on the *front-end*.

iOS Shortcuts, if you do not know it, is also an amazing free application available that allow to build workflows to automate tasks. As Power Automate, defining an iOS workflow is adding steps and triggers.

![iOS Shortcuts]({{site.baseurl}}/assets/img/posts/2020-02-06-gtd-vscode-mspowerautomate-iosshortcut/ios-shortcuts.png){:width="400px"}

1 - Scripting activity to ask for input

This built in action will open a popup asking to input the thought you want to capture (or if you are using Siri via voice, it will record what you say).

2 - Store this input into a variable

Create a new variable from the input gathered step 1.

3 - The magic: post this text to my HTTP trigger in Power Automate

This step will actually make an HTTP call, with Post to the Power Automate flow (make sure to replace *{URL Power Automate}* with the URL you get from step 1 of the Power Automate workflow). Add a *json* body, with the variable *text* (as we have specified previously). Nothing more. Simple, eh?

So now, I think I am good, job done!

- [x] Text based notes tool (that can be markdown, but markdown is text-based)
- [x] Search capabilities (notes file name & content search)
- [x] Keyboards shortcut for quicker access to my content
- [x] Accessible from Windows 10, OSX and iOS 
- [x] Way to capture what crosses my mind, whether I am on my phone or on my computer
- [x] Captured thoughts must be timestamped and stored in the same repository as my entire notes

# Conclusion

With no programming, and tools we have at our disposal (except Power Automate, all the other tools are free), we can achieve great things. I've been using that process for a few weeks now, and I am perfectly happy. I will see how it goes on the long run.