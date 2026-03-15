=== OhScoop — Recipe Card Block ===
Contributors: cybertrickz
Tags: recipe, recipe card, gutenberg, block, gelato, ice cream, frozen dessert, ninja creami, food blog, schema, nutrition
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 2.1.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A beautiful Gutenberg recipe card block for any recipe — frozen desserts, ice cream, gelato, and beyond. With Schema markup, star ratings, adjustable servings, US/Metric toggle, print mode, cook mode, and affiliate links.

== Description ==

**OhScoop** is a full-featured WordPress recipe card plugin built natively for the Gutenberg block editor. Click any field to edit inline — no shortcodes, no popups, no forms.

Perfect for Ninja Creami recipes, gelato, ice cream, sorbet, and any other food recipe.

= Features =

**Recipe Card Block**
* Inline editing — click any field to edit directly
* Recipe image with Google Schema support
* Customisable machine badge (Ninja Creami or any appliance)
* Adjustable servings — amounts scale automatically
* US / Metric unit toggle for readers
* Print-friendly stylesheet
* Cook Mode — keeps phone screen awake while cooking (via Wake Lock API)
* Equipment list with optional affiliate links
* Per-ingredient affiliate links (Amazon, etc.)
* YouTube / video embed
* Star ratings for readers
* Complete nutrition information panel
* Dietary badges (Gluten-free, Vegan, etc.)
* Allergen warnings
* Customisable accent colour and header gradient

**Jump to Recipe Block**
* Separate block to place at the top of your post
* Scrolls reader straight to the recipe card
* Customisable label and colour

**SEO & Schema**
* Full JSON-LD Recipe Schema (Google rich results eligible)
* Includes: name, description, image, author, dates, category, cuisine, prepTime, cookTime, totalTime, yield, ingredients, instructions, nutrition, aggregateRating, video, keywords
* Falls back to post featured image if no recipe image set

= How to use =

1. Install and activate the plugin
2. Open any post in the Gutenberg editor
3. Click **+** to add a block, or type `/ohscoop`
4. Choose **OhScoop Recipe Card** — the full card appears in the editor
5. Click any field to edit inline
6. Use the right sidebar panels for nutrition, SEO, colours, and more
7. Optionally add the **OhScoop: Jump to Recipe** block at the top of your post

= Affiliate links =

Each ingredient and equipment item has an optional affiliate URL field. When filled, the ingredient name becomes a link in the published recipe. Links are automatically marked with `rel="nofollow sponsored noopener"` for compliance.

= Customisation =

* Accent colour — changed per-recipe via the Colours sidebar panel
* Machine badge — rename it to any appliance (or disable it entirely)
* Header gradient — edit directly in the Colours panel

== Installation ==

1. Upload the `ohscoop-recipe-card` folder to `/wp-content/plugins/`
2. Activate the plugin via **Plugins → Installed Plugins**
3. In any post, type `/ohscoop` to insert the recipe block

== Frequently Asked Questions ==

= Does this work with the Classic Editor? =
No — OhScoop is built for the Gutenberg block editor (WordPress 6.0+).

= Will my recipes show in Google Search? =
Yes — the plugin outputs full Recipe Schema (JSON-LD) which makes your recipes eligible for Google rich results, including star ratings, cook time, and calorie display in search.

= Can I use my own affiliate links? =
Yes — each ingredient and equipment item has an affiliate URL field. Links are published with proper nofollow/sponsored attributes.

= Does the serving adjuster recalculate fractions? =
Yes — the JS scaler handles common fractions (½, ¼, ⅔, etc.) and converts them automatically when servings change.

= What is Cook Mode? =
Cook Mode uses the browser's Wake Lock API to prevent the phone screen from going dark while cooking. Supported in Chrome, Edge, and modern Android browsers.

= Is there a free version? =
Yes — this is the full plugin, free and open source.

== Screenshots ==

1. The recipe card on the frontend — with image, info grid, ingredients, steps, and nutrition
2. Editing inline in the Gutenberg editor — click any field to change it
3. The sidebar panels — nutrition, SEO times, colours, rating
4. Google rich result preview with Schema markup active

== Changelog ==

= 2.0.0 =
* Complete rewrite — full v2.0 feature set
* Added: Google Schema / JSON-LD markup
* Added: Recipe image field
* Added: Star ratings for readers
* Added: Adjustable servings with fraction scaling
* Added: US / Metric unit toggle
* Added: Cook Mode (Wake Lock API)
* Added: Print button + print stylesheet
* Added: Equipment list with affiliate links
* Added: Per-ingredient affiliate links
* Added: YouTube / video embed
* Added: Jump to Recipe block
* Added: Sodium field in nutrition
* Added: Customisable accent colour
* Added: Machine badge toggle (rename or disable)
* Added: ISO 8601 time fields for Schema
* Added: Keywords field for Schema
* Plugin renamed to OhScoop
* Author: cybertrickz (cybertrickz.info)

= 1.0.0 =
* Initial release — Ninja Creami Recipe Card

== Upgrade Notice ==

= 2.0.0 =
Major update — adds Schema markup, star ratings, servings adjuster, cook mode, affiliate links, and more. Upgrade recommended for all users.
