---
layout: post
title: Cross desktop application development sample using Xamarin.Forms
date: 2020-10-21 10:00:00 +0100
description: Here is a small sample app using Xamarin.Forms, part of an article in Programmez
img: posts/2020-10-21-cross-desktop-app/cover.png
fig-caption: 
tags: [C#, Xamarin.Forms, MacOS]
guid: b296bb82-64e7-468f-823a-13bf941c3e11
---
For an article in [Programmez](https://www.programmez.com/), in french, that will be published in late in October 2020, I did a sample walk through on how to develop a simple application using [Xamarin.Forms](https://docs.microsoft.com/en-US/xamarin/xamarin-forms/) targeting both Windows 10/8 and MacOS.

# What it looks like

This is a basic notepad called CrossPad that can be found on my [Github](https://github.com/jchomarat/CrossPad). The idea was to leverage Xamarin capabilities to develop an application with a minimum of custom code for one platform.

Of course this evolves rapidly, and in the coming months Microsoft will publish the first preview version of [Maui](https://github.com/dotnet/maui), the evolution of Xamarin.Forms to simplify cross platform development.

Here are some print screens of this application

* WPF version

![CSV sample]({{site.baseurl}}/assets/img/posts/2020-10-21-cross-desktop-app/CrossPad.WPF.png){:width="500px"}

* UWP (Universel Windows Platform) version

![CSV sample]({{site.baseurl}}/assets/img/posts/2020-10-21-cross-desktop-app/CrossPad.UWP.png){:width="500px"}

* MacOS version

![CSV sample]({{site.baseurl}}/assets/img/posts/2020-10-21-cross-desktop-app/CrossPad.MacOS.png){:width="500px"}

You can browse the [code](https://github.com/jchomarat/CrossPad) and use it as a baseline for your projects.

# Stay tuned

As I have said above, things are moving quiclky, and Microsoft has just released a couple of things to extend cross platform development:

* [WebView2](https://docs.microsoft.com/en-us/microsoft-edge/webview2/)

> The Microsoft Edge WebView2 control enables you to embed web technologies (HTML, CSS, and JavaScript) in your native applications. The WebView2 control uses Microsoft Edge (Chromium) as the rendering engine to display the web content in native applications. With WebView2, you may embed web code in different parts of your native application, or build the entire native application within a single WebView

* [WinUI 3.0](https://docs.microsoft.com/en-US/windows/apps/winui/winui3/)

> The Windows UI Library (WinUI) is a native user experience (UX) framework for both Windows Desktop and UWP applications. By incorporating the Fluent Design System into all experiences, controls, and styles, WinUI provides consistent, intuitive, and accessible experiences using the latest user interface (UI) patterns. With support for both Desktop and UWP apps, you can build with WinUI from the ground up, or gradually migrate your existing MFC, WinForms, or WPF apps using familiar languages such as C++, C#, Visual Basic, and Javascript 

Although it is not *yet* for cross platform, but who knows ...