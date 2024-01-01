

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

It is forked from https://github.com/csb324/spell-cards-5e. The point of this fork is to dockerize it and allow the use of a local 5e api.

# [DnD Spell Cards](https://dndspellcards.com/)

This is a little web app that makes it easy to generate printable PDFs of your dungeons and dragons spells! Those printable PDFs can easily be cut up and treated like cards. I like to keep mine in a binder, so, that's why I wanted this.

Many thanks to [DnD5eAPI](https://www.dnd5eapi.co/), [Game Icons](https://game-icons.net/), and the [SRD](https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf).

In order to run this image, simply execute:

docker run -p 3000:3000 ghcr.io/sungray/spell-cards-5e:latest

The 5E_API env variable is optional and will default to 'https://www.dnd5eapi.co/'.

You can also add -e USE_LOCAL_FILES = true to use your own collection of json files instead. Use -v /your/json/spell/folder:/usr/src/app/custom-spells and there you can add your own collection of json files.

There are a few optional environment variables you can use:
 -e 5E_API = 'http://5e-api-ip/'
   replace the API endpoint. Will default to 'https://www.dnd5eapi.co/'.
 
 -e USE_LOCAL_FILES = true
   use your own collection of json files instead. Below is an example of how the json should be structured. The json file names should start with spells- and end with .json.
The custom spells will be looked up in the /usr/src/app/custom-spells, so it is recommended to mount that as a volume.
-v /your/json/spell/folder:/usr/src/app/custom-spells

For instance, spells-custom.json :

```
{
	"spell": [
		{
			"name": "Fire Bolt",
			"source": "PHB",
			"page": 242,
			"srd": true,
			"basicRules": true,
			"level": 0,
			"school": "V",
			"time": [
				{
					"number": 1,
					"unit": "action"
				}
			],
			"range": {
				"type": "point",
				"distance": {
					"type": "feet",
					"amount": 120
				}
			},
			"components": {
				"v": true,
				"s": true
			},
			"duration": [
				{
					"type": "instant"
				}
			],
			"entries": [
				"You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes {@damage 1d10} fire damage. A flammable object hit by this spell ignites if it isn't being worn or carried.",
				"This spell's damage increases by {@dice 1d10} when you reach 5th level ({@damage 2d10}), 11th level ({@damage 3d10}), and 17th level ({@damage 4d10})."
			],
			"scalingLevelDice": {
				"label": "fire damage",
				"scaling": {
					"1": "1d10",
					"5": "2d10",
					"11": "3d10",
					"17": "4d10"
				}
			},
			"damageInflict": [
				"fire"
			],
			"spellAttack": [
				"R"
			],
			"miscTags": [
				"OBJ",
				"SCL"
			],
			"areaTags": [
				"ST"
			]
		},
		{
			"name": "Fire Shield",
			"source": "PHB",
			"page": 242,
			"srd": true,
			"level": 4,
			"school": "V",
			"time": [
				{
					"number": 1,
					"unit": "action"
				}
			],
			"range": {
				"type": "point",
				"distance": {
					"type": "self"
				}
			},
			"components": {
				"v": true,
				"s": true,
				"m": "a bit of phosphorus or a firefly"
			},
			"duration": [
				{
					"type": "timed",
					"duration": {
						"type": "minute",
						"amount": 10
					}
				}
			],
			"entries": [
				"Thin and wispy flames wreathe your body for the duration, shedding bright light in a 10-foot radius and dim light for an additional 10 feet. You can end the spell early by using an action to dismiss it.",
				"The flames provide you with a warm shield or a chill shield, as you choose. The warm shield grants you resistance to cold damage, and the chill shield grants you resistance to fire damage.",
				"In addition, whenever a creature within 5 feet of you hits you with a melee attack, the shield erupts with flame. The attacker takes {@damage 2d8} fire damage from a warm shield, or {@damage 2d8} cold damage from a cold shield."
			],
			"damageResist": [
				"cold",
				"fire"
			],
			"damageInflict": [
				"cold",
				"fire"
			],
			"miscTags": [
				"LGT"
			]
		}
	]
}
```
