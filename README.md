# OhScoop — Recipe Card Block

> A beautiful Gutenberg recipe card block for frozen desserts and any recipe type.
> Built by [cybertrickz](https://cybertrickz.info)

[![WordPress](https://img.shields.io/badge/WordPress-6.0%2B-blue)](https://wordpress.org)
[![License](https://img.shields.io/badge/License-GPL2-green)](https://www.gnu.org/licenses/gpl-2.0.html)
[![Version](https://img.shields.io/badge/Version-2.2.1-purple)](https://cybertrickz.info/ohscoop)

---

## Features

### Recipe Card Block
- ✅ Inline editing in Gutenberg — click any field to edit
- ✅ Recipe image with Google Schema support
- ✅ Machine badge (Ninja Creami or any appliance — configurable)
- ✅ Adjustable servings — fractions scale automatically
- ✅ US / Metric unit toggle for readers
- ✅ Print button + full print stylesheet
- ✅ Cook Mode — keeps phone screen awake (Wake Lock API)
- ✅ Equipment list with optional affiliate links
- ✅ Per-ingredient affiliate links (Amazon, etc.)
- ✅ YouTube / video embed
- ✅ Star ratings (frontend + Schema)
- ✅ Full nutrition panel (calories, fat, carbs, protein, sugar, fibre, sodium)
- ✅ Dietary badges + allergen warnings
- ✅ Customisable accent colour
- ✅ Full Google Recipe Schema / JSON-LD output

### Jump to Recipe Block
- ✅ Separate block for top of post
- ✅ Scrolls to recipe card
- ✅ Customisable label and colour

---

## Installation

### From WordPress.org (recommended)
1. Go to **Plugins → Add New**
2. Search for **OhScoop**
3. Install and activate

### Manual upload
1. Download the latest zip from [Releases](../../releases)
2. Go to **Plugins → Add New → Upload Plugin**
3. Upload the zip and activate

### From GitHub (development)
```bash
git clone https://github.com/yourusername/ohscoop-recipe-card.git
```
Copy the folder to your `/wp-content/plugins/` directory and activate.

---

## Usage

1. Open any post in the Gutenberg editor
2. Type `/ohscoop` and select **OhScoop Recipe Card**
3. Click any field to edit inline
4. Use the **right sidebar panels** for:
   - Nutrition values
   - ISO times for Schema
   - Category, cuisine, keywords
   - Star rating settings
   - Accent colour
   - Machine badge toggle
5. Optionally add **OhScoop: Jump to Recipe** block at the top of your post

---

## File Structure

```
ohscoop-recipe-card/
├── ohscoop-recipe-card.php     ← Main plugin file
├── readme.txt                  ← WordPress.org readme
├── README.md                   ← This file
├── includes/
│   ├── schema.php              ← JSON-LD Schema output
│   └── jump-button.php         ← Jump to Recipe block registration
└── build/
    ├── block.js                ← Gutenberg block editor JS (no build needed)
    ├── frontend.js             ← Frontend interactions (unit toggle, servings, etc.)
    ├── style.css               ← Frontend + print styles
    └── editor.css              ← Editor-only styles
```

---

## Versioning

This plugin follows [Semantic Versioning](https://semver.org/):
- `MAJOR` — breaking changes
- `MINOR` — new features, backward compatible
- `PATCH` — bug fixes

---

## Roadmap

- [ ] AJAX star rating (save to database)
- [ ] Recipe custom post type
- [ ] Recipe index / archive block
- [ ] Import from other recipe plugins
- [ ] Nutritional API auto-calculation
- [ ] Multiple card styles / themes

---

## Contributing

Pull requests welcome. Please open an issue first to discuss major changes.

---

## Author

**cybertrickz**
- Website: [cybertrickz.info](https://cybertrickz.info)
- Plugin page: [cybertrickz.info/ohscoop](https://cybertrickz.info/ohscoop)

---

## License

GPL-2.0-or-later — see [LICENSE](LICENSE) file.
