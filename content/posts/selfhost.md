---
title: "Hosting Open Source Projects At Home"
date: 2022-06-02T20:46:30+03:00
draft: true
---

## Table of Contents
- [Table of Contents](#table-of-contents)
  - [Why](#why)
  - [How](#how)
    - [Booting Up Raspberry PI](#booting-up-raspberry-pi)
    - [We need to CONTAIN them!](#we-need-to-contain-them)




### Why

So, why would you ever need to host anything at home? We live in the age of cloud computing. You can sign up with any mainstream provider and have all the functionality of the services we are going to talk about, without all the configuration hassle.

There are three main reasons for me.
First and foremost, it is fun. Configuring and setting up a home server that works fluidly without needing much maintanence is satisfying. If this sounds ridiculous to you, other reasons aren't important. It comes down to personal preference. Cloud is OK.

This brings us to the second reason. Where cloud may not be OK. 

Privacy. We all know that our data is already spilled out there. No matter how much you try, if you are benefiting from FAANG services, they own and sell your data. It may be an acceptable trade in exchange of the services they provide. I am OK with that. However, if you are not, self hosting is also for you.

Thirdly, there are some projects that help you administer your internal home network. 
For example you can set up an intermediary dns server and block ads on all of the devices connected to your WiFi without any browser extension or adblock installment. You can't easily do this with any of the cloud services.

### How

First thing to get is an old pc which is lying around. Or better, a raspberry pi... or better, a rpi cluster!

Raspberry PI is the most efficient way to go in my opinion.
It is:
- cheap 
- tiny (you can stick it to your wall)
- low power usage (consumes 1W on average - I have model 3b)
- has everything you need to get started

#### Booting Up Raspberry PI

- First, flash an OS.
  - Easiest and most compatible is the Raspberry Pi OS.
  - I recommend 64-bit version because some docker images are only compatible with it.
  - Find the list [here](https://www.raspberrypi.com/software/operating-systems/)
  - I have the desktop version but you don't necessarily need it.
  - Download and follow the instructions on the *Raspberry Pi Imager.*
  - SSH and WiFi configuration step is important in the imager. We will connect with SSH.

#### We need to CONTAIN them!

If you are hosting more than one project with different infrastructures, docker saves the day. Best thing about these open source project developers are that they also release their docker images. You don't even need to build the image nowadays. Just downloading from the hub and slapping some parameters makes it ready to go.

`sudo apt-get update && sudo apt-get upgrade`

`curl -fsSL https://get.docker.com -o get-docker.sh`

`sudo sh get-docker.sh`

Now we are ready to download and run some projects which are built for self-hosting!

My current running project list is:
- **Portainer**: Manage your docker ecosystem with a web interface. This is a must imho.
- **Watchtower**: Automatically update your docker images to the latest version from the hub.
- **Bitwarden**: Best password manager out there. 
- **Pihole**: DNS Ad-Blocker for your home network.
- **My Side Projects**: 
  - Custom Discord bot.
  - Simple ethereum low gas price e-mail notifier. 


Let's look into how we can set up most of them.