---
layout: post
title: Using .Net Spark notebook in Azure Synapse
date: 2020-09-04 10:00:00 +0100
description: Here is a small sample of a C# notebook to manipulate and process data from a DataLake.
img: posts/2020-09-04-synapse-net-spark/cover.png
fig-caption: 
tags: [Synapse, C#, Spark, Data]
guid: b296bb82-64e7-468f-823a-13bf941c3e10
---
While attending an Openhack on Data wharehouse, we decided to go with [Azure Synapse Analytics](https://docs.microsoft.com/en-us/azure/synapse-analytics/overview-what-is), still in preview as in September 2020, to manage our entire data processing:

1. Centralize data from various sources into a Data Lake
2. Aggregate data of same type into one
3. Build a [star schema](https://en.wikipedia.org/wiki/Star_schema) from this data
4. Export it into SQL Server in order to analyse it via PowerBI

*In the old days*, it would have required several different tools to complete all of these steps. But today, [Azure Synapse Analytics](https://docs.microsoft.com/en-us/azure/synapse-analytics/overview-what-is) is one tool *to rule them all* ...

The purpose of this post is not to show big data (mostly because it is not my job role and I would not be pertinent) but to show how a developer such as myself, who literally loves C#, can leverage that into big data.

# What is Azure Synapse Analytics

From the official [documentation](https://docs.microsoft.com/en-US/azure/synapse-analytics/spark/apache-spark-overview), Azure Synapse Analytics is "one of Microsoft's implementations of Apache Spark in the cloud [...] Apache Spark being a parallel processing framework that supports in-memory processing to boost the performance of big-data analytic applications?".

Why is it interesting now? The reason is simple: Synapse introduces an extra layer on top of the big data framework Apache Spark in .NET. So yes, we can now do *big data* using the langagues we love: Scala, Python and now C#!

We can see below this high level architecture of that implementation:

![.NET Spark architecture]({{site.baseurl}}/assets/img/posts/2020-09-04-synapse-net-spark/dotnet-spark-architecture.png){:width="500px"}

# Use case

Just for a kick start in .NET Spark, let's take a simple sample. I have a DataLake that contains an input CSV file listing movies. This DataLake is an [Azure Data Lake Storage Gen2](https://docs.microsoft.com/en-US/azure/storage/blobs/data-lake-storage-introduction) with a container called *input* in which the CSV file is stored:

![CSV sample]({{site.baseurl}}/assets/img/posts/2020-09-04-synapse-net-spark/sample-csv.png){:width="500px"}

This is a raw dataset that we want to clean and prepare for analysis. Here are the stesp to clean our data
1. Add a unique ID for our movies list,
2. Extract subject into an external dataset, and store a subject ID instead
3. Break actor and actress columns into an external dataset with a list of actors, both female and male,
4. Add a mapping dataset actorsMovie to store the list of actors per movies
5. Finally, generate a movie dataset with IDs (this work could also be done for Directors, but it is exactly as subjects)

# Let's begin!

## Create a .NET Spark notebook

[I assume here that you have an Azure Subscription, and in this subscription you have created an Azure Synapse Analytics resource].

From the left menu, go to Develop, and add a new notebook. To prove that .NET works, here is a small exemple:


![notebook csharp support]({{site.baseurl}}/assets/img/posts/2020-09-04-synapse-net-spark/notebook-dotnet-sample.png){:width="600px"}

We can see that the language is .NET Spark (C#) (top right corner) along with a very basic C# code inside the notebook. And of course, it works!

## Load our source csv into a data frame

First thing first, let's add a new cell in our notebook to load the CSV file from the data lake into a data frame:

```csharp
var accountName = "{Storage account}";
var containerName = "{Container}";
var file = "/movies-dataset.csv";

// Build the ADLS path to that file
var adlsInputPath = $"abfss://{containerName}@{accountName}.dfs.core.windows.net/{file}";
```

Make sure to adapt *accountName*, *containerName* and *file* variables.

## Display in the notebook this source data

As we would do in Python or Scala, let's show a table on the notebook with an extract of my CSV file:

```csharp
var inputReader = spark.Read()
    .Option("header", true)
    .Option("delimiter", ";")
    .Option("charset", "iso-8859-1");

var inputDataFrame = inputReader.Csv(new string[] {adlsInputPath});

// Add a unique ID to our movies list
inputDataFrame = inputDataFrame
    .WithColumn("MovieID", Expr("uuid()"));

// Display the DataFrame
Display(inputDataFrame);
```

We first create a reader with a few options (presence of a header, delimimter and encoding). 

We then add a new column do our data frame with a unique ID (because the source data did not have any) - and finally display this data frame using the function *Display*. Executing the cell (or pressing CTRL+Return) will result in:

![Source dataframe in notebook]({{site.baseurl}}/assets/img/posts/2020-09-04-synapse-net-spark/notebook-source-dataframe.png){:width="600px"}

## Extract dimensions into separate dataframes

As we have discussed above, in our cleaning process, we want to extract dimensions from this main source file and only reference IDs. So let's extract Subject first. In a new cell, let's use the following code:

```csharp
var subjectDataFrame = inputDataFrame
        .Select("Subject")
        .DropDuplicates()
        .Filter("Subject != ''")
        .WithColumn("SubjectID", Expr("uuid()"))
        .Select("SubjectID", "Subject").OrderBy("Subject");

// Display the DataFrame
Display(subjectDataFrame);
```
In the first 6 lignes, we select only Subject from the source data, remove duplicate and empty strings. We also add a column with a unique identifier - and we finally select the columns in the right order and properly sorted out. We obtain then a new data frame. We will deal with reinjecting the ID later.

Let's do the same procedure here with Actors. This dataset (found [here](https://perso.telecom-paristech.fr/eagan/class/igr204/datasets)) has 2 columns with the principal female and male actors. The idea here is to extract all these actors into a separate data frame with a unique ID. We will also need a link data frame to tell which movie has which actors. Below the tables to represent the final model we want:

* **Actors**

| ActorID  | ActorName  |
|---|---|
| 123 | Jane |
| 456 | John |

* **ActorsMovie**

| MovieID  | ActorID  |
|---|---|
| AAA | 123 |
| AAA | 456 |

Jane and John are actors of movie AAA

* **Movies**

The Movies data frame will contain nothing in particular as, because of the ID, we will be able to retreive the actors list.

To achieve that, the code is a little bit more complex than for subject, but still easily doable in C#:

```csharp
var actorDataFrame = inputDataFrame
    .Select("Actor")
    .DropDuplicates()
    .Filter("Actor != ''")
    .Union(inputDataFrame.Select("Actress").DropDuplicates().Filter("Actress != ''"))
    .WithColumn("ActorID", Expr("uuid()"))
    .WithColumnRenamed("Actor", "ActorName")
    .Select("ActorID", "ActorName").OrderBy("ActorName");

Display(actorDataFrame);
```

We are using *union* here to aggregate a set of rows into one data frame (first list is the *Actor* selection and second one is *Actress* selection).

```csharp
var actorsMovieDataFrame = inputDataFrame
    .Select("MovieID", "Actor")
    .Filter("Actor != ''")
    .Union(inputDataFrame.Select("MovieID", "Actress").Filter("Actress != ''"))
    .WithColumnRenamed("Actor", "ActorName")
    .Join(actorDataFrame, new string[] {"ActorName"}, "left")
    .Select("MovieID", "ActorID");

Display(actorsMovieDataFrame);
```
We aee using here the same approach to generate our *ActorsMovie* data frame.

## Optimize our Movie dataframe

We have now extracted our dimensions (appart from Directors that we could have done also, but nothing new to learn here), let's generate our *Movies* data frame by removing *Subject*, *Actor*, *Actress* and left joining *SubjectID* from the *Subjects* data frame

```csharp
var moviesDataFrame = inputDataFrame
    .Join(subjectDataFrame, new string[] {"Subject"}, "left")
    .Select("MovieID", "Title", "Year", "Length", "SubjectID", "Director", "Awards")
    .OrderBy("Title");

Display(moviesDataFrame);
```

## Save our processed data back to the data lake

We have done some (basic) data processing. We end up with four data frames in memory

* Subject
* Actor
* ActorsMovie
* Movies

We need now to save that back into our data lake so that we can use PowerBI to analyse that. Of course, in this approach we will only have dimensions data and not facts (for a star schema) but again, the idea was to show some C# here ...

We have of course several options to save our data frame: csv, parquet, json or directly into an SQL database. Let's show a simple exemple with CSV:

```csharp
// Destination
var containerOutput = "output";
var adlsPathOutput = $"abfss://{containerOutput}@{accountName}.dfs.core.windows.net/";

subjectDataFrame.Write().Mode(SaveMode.Overwrite).Option("header", true).Csv(adlsPathOutput + "subject");
actorDataFrame.Write().Mode(SaveMode.Overwrite).Option("header", true).Csv(adlsPathOutput + "actor");
//.. etc for the other data frames
```

To save in [parquet format](https://en.wikipedia.org/wiki/Apache_Parquet), we simply need to call the *Parquet* method instead of *Csv*.

And finally, if we want to export this clean data into SQL Server, we can use T-SQL command

```sql
COPY INTO dbo.Subjects
FROM 'https://{Storage Account}.blob.core.windows.net/output/subject'
WITH  (
...
)
```

This command will connect to the blob storage (data lake) (credentials are passed in the With option) and copied directly into SQL. This is one of the most efficient approach. To learn more about that, you can go [there](https://docs.microsoft.com/en-US/sql/t-sql/statements/copy-into-transact-sql?view=azure-sqldw-latest).

This command can be included into a pipeline process so that it occurs at the end of the notebook execution.


# Conclusion

In this post we haven't learn anything in big data *per sé*, nor learn all the capabilities of Azure Synapse Analytics. We *did* see however how we can leverage our C#, and more generally .NET experience, into notebook for data processing. What we have noticed though is the objects used in C# are the same as for the other languages such as Python or Scala. That makes it easier to ramp up.

You can find some resources below

* [Official .NET Spark documentation] (https://docs.microsoft.com/en-us/dotnet/api/?view=spark-dotnet)
* [Synapse documentation] (https://docs.microsoft.com/en-US/azure/synapse-analytics/sql-data-warehouse/)