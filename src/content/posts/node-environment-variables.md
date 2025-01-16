---
title: How to (easily) set up Node environment variables in your JS application
description: A straightforward guide to managing environment variables in Node.js applications
date: 2017-06-20
tags:
---

I scoured the web for this information and couldn’t find a single resource that described how to set up environment variables in a Node.js process that actually worked for me. I finally found this info in a [helpful video](https://youtu.be/gYjHDMPrkWU?t=11m18s) by [Chris Courses on YouTube](https://www.youtube.com/channel/UC9Yp2yz6-pwhQuPlIDV_mjA), so I wanted to share it with you here in a concise way. It sounds like there are probably other ways to achieve this, but this is the one that worked for me, and I hope it’s helpful for you.



## Step 1: .gitignore

We’re going to add the variables to a file called simply `.env`, but before we do, let’s make sure to add `.env` to our `.gitignore` file. If you’re using [create-react-app](https://github.com/facebook/create-react-app) like I am, this should already be done for you, but it’s good to double-check. (If you don’t know about `.gitignore`, learn more [here](https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files).)

The primary reason for ignoring this file is that we don’t want to track passwords, API keys, and other sensitive information in a git repo—especially a public one. Our `.gitignore` file in the root of our project should look something like this:

```
    # dependencies
    /node_modules
    # misc
    .DS_Store
    .env
```



## Step 2: .env.default

Now let’s define the variables we’ll be using. To keep it simple, let’s assume that we want one variable that will indicate whether we’re in development or production mode, plus a few others that tell us some information about the database we’ll be using.

In the root of our project, we’re going to make a file called `.env.default`. This type of file has some fancy abilities that allow us to reset any previously set environment variables to empty values, but for now, just think of it mainly as a template that we can reference later when setting the values. That way, we know which variables we’re supposed to use.

You can use whatever names you’d like, but the general naming convention is all caps with underscores between words. Our `.env.default` file now looks like this:

```
    NODE_ENV=
    DB_HOST=
    DB_USER=
    DB_PASSWORD=
    DB_NAME=
```

Don’t worry about the empty assignments. Remember, this is just a reminder for later.



## Step 3: .env

Great! So we know which variables we want to use; now we just need to assign them. Let’s go ahead and add a `.env` file to the root of our project. It should show up right next to our `.env.default` file in the project tree.

We can copy and paste the contents of our `.env.default` file into this one and assign some values. The `.env` file should now look something like this (with your own relevant values):

```
    NODE_ENV=development
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=baconpancakes
    DB_NAME=tree_fort
```

If you come mainly from JavaScript, this may look a little foreign, but don’t worry about the lack of quotes, spaces, or semicolons. Just set up the file like this and input your own values!



## Step 4: require

So we have our variables set, and now we just need to make our program run this file so that we can use them.

First, make sure you have the [dotenv package](https://www.npmjs.com/package/dotenv) installed by running either:

    `yarn add dotenv`

or

    `npm install dotenv --save`

Then, simply include this line of code in one of your backend files:

    `require('dotenv').config();`

I know, this looks a little weird as well, but it’s the right way to load the variables. You only need to include this line once in your project. I have it in the file where I set up my database connection, but it seems to work equally well if I include it in my server setup instead.

Then, we’re free to use the variables that we set! We can access them through the `process.env` object. Here’s an example:
```
    console.log(process.env.DB_PASSWORD); // baconpancakes
    console.log(process.env.DB_USER);     // root
```

Note that these environment variables will **only** work on the backend of your application. I tried them on the frontend, and my app didn’t like it at all. If you have a good solution for a similar effect on the frontend, let me know!



I hope you found this article helpful. I know I was looking for this information for a long time. Please leave comments with questions, corrections, or better ways to set environment variables for Node!

