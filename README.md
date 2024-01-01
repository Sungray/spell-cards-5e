

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

It is forked from https://github.com/csb324/spell-cards-5e. The point of this fork is to dockerize it and allow the use of a local 5e api.

# [DnD Spell Cards](https://dndspellcards.com/)

This is a little web app that makes it easy to generate printable PDFs of your dungeons and dragons spells! Those printable PDFs can easily be cut up and treated like cards. I like to keep mine in a binder, so, that's why I wanted this.

Many thanks to [DnD5eAPI](https://www.dnd5eapi.co/), [Game Icons](https://game-icons.net/), and the [SRD](https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf).

In order to run this image, simply execute:

docker run -p 3000:3000 -e 5E_API='http://5e-api-ip/' ghcr.io/sungray/spell-cards-5e:latest

The 5E_API env variable is optional and will default to 'https://www.dnd5eapi.co/'.
