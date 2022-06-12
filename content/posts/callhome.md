---
title: "Calling Home"
date: 2022-06-12T16:15:03+03:00
draft: false
---

***Too Long, Didn't Read:*** I use a simple app to connect to my home network from anywhere in the world. 

As you buy little gadgets that connect to internet, you begin to realize the need, the need for *spee...* ehm, no, the need for connecting to your home network. Nowadays your gadget also comes with its software which enables you to control it from a mobile app or their website or something so you don't worry about anything. But how does that work? How can you see what your device is doing at home? Isn't it supposed to be a isolated network with firewalls to prevent strangers from accessing it? 

It is. Usually there is no way for anyone to send a request to your external IP and get a response. All the inbound ports of your home network is closed as default. Your router's default firewall should prevent this. No stranger can **start** a communication. However they can *respond* to a communication which is started by you. If the firewall hadn't been allowing these responses, you wouldn't have been reading this.

{{< figure align=center src="/pics/et-call-home.png" caption="Equipment used by E.T. to call home" >}}

That's why in the olden days, you needed to forward a port (meaning, to open it to external world). You see why this is insecure. Anyone that know or stumble upon your public IP can scan and send requests to your open port. If you run anything vulnerable behind that port, you are in trouble. 

What to do? You can use a VPN service. You may have heard of *Hamachi*. Many years ago (before the age of Steam) we were using it to play multiplayer games without port forwarding. It was easy to use and it simulated a LAN. So we just started it up, connected to it and shared our local server. At that time it felt like magic. 

### Great software built alike

I, like everyone else, love a software that:
- has one basic job
- does it perfectly (fast, no need for extensive configuration)
- intuitive (no need for devops skills)
- lightweight
- no shady ads

Last year I felt this elusive feeling of magic again. It was [Tailscale](https://tailscale.com/). Built on open source VPN backbone [Wireguard](https://www.wireguard.com/), it was simple to set up. Worked out of the box on all of my devices, including a raspberry pi, a Windows PC and iOS. 

What is it for? It lets you create your own VPN. Most useful thing about this is, you can connect devices to this VPN and just do what you gotta do like you never left home. Nobody can interfere with your IP packets because they are end-to-end encrypted in every step of the journey peer-to-peer. 

### The warm feeling of *"open-source"*
You may be asking "so you are going to just trust this?" I may be answering, you gotta trust something in the end. Or you can investigate the open source repo of wireguard and key generation steps of tailscale. I didn't. That's how much I trust "open-source" buzzword. Heh, *heh...*

### Smart home apps?

Do you really need this? If you have those apps I mentioned, the ones that come with the product you bought, you don't really *need* to set up something to connect home. They act as a control center between the actual home device and your client (mobile phone or pc). Both of these devices send requests to the centralized control center server and it relays the information. I don't think these services focus on the encryption side of things. Sure, the traffic may flow through SSL, however, some company personnel can configure your account so that next time your home device polls for some command to execute, it will execute a command you did not put there. There is no guarantee if there is no end-to-end encryption between you and the target device at home.

On the other hand, if you are [self hosting](https://okankonur.com/posts/selfhost/) some projects from your home, that means you don't have any commercial middleware apps or servers for your custom projects. So you need to connect directly. 

### OK but how does Tailscale differ?

Tailscale also have a control center layer that they call "control plane". This greatly simplifies things in terms of key exchange. The difference from commercial apps is, traffic is encrypted and it is not routed over their servers (if you have a UDP port open and allow direct connection), you connect directly to your target. But it also works without port forwarding, thanks to Tailscale's [NAT traversal](https://tailscale.com/blog/how-nat-traversal-works/). Even if you have dynamic IP and no open ports. 

In summary, you have two options regarding port forwarding with tailscale:
1. Forward an UDP port to directly (real-undiluted p2p) connect to your home. 
    - Difference from forwarding your 443 port and connecting via TLS is, you don't need to boot up a TLS compatible web application server behind your port. The traffic will be encrypted over Wireguard. 
2. Leave your firewall as is. Trust the relay servers of tailscale.
    - I do this. I trust the relay server because Man in the Middle attacks are prevented via Wireguard by default. And I don't see any noticable performance bottleneck.


Wireguard works with asymmetric encryption. It must have private-public key pairs for **each** device on the network. The public keys must be known for each device. Devices create the private one locally without telling anyone. But the corresponding public key is sent to the server where it is listed for anyone else on the same account's network ip list to see.

Tailscale assigns internal IPs for each device. If your local tailscale app is active, you can connect to these ip addresses and the traffic will be end-to-end encrypted. If any of these devices allows access to their UDP ports, connection will be peer-to-peer. If not, tailscale will use their relay servers.

{{< figure align=center src="/pics/tailscale-ip.png" caption="Tailscale Internal IP List" >}}

All in all, I am very satisfied with this setup and wanted to give my thanks to Tailscale by writing about it.