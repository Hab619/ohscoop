( function( blocks, element, blockEditor, components ) {
    'use strict';

    var el                = element.createElement;
    var Fragment          = element.Fragment;
    var useState          = element.useState;
    var registerBlockType = blocks.registerBlockType;
    var useBlockProps     = blockEditor.useBlockProps;
    var RichText          = blockEditor.RichText;
    var MediaUpload       = blockEditor.MediaUpload;
    var MediaUploadCheck  = blockEditor.MediaUploadCheck;
    var InspectorControls = blockEditor.InspectorControls;
    var ColorPalette      = blockEditor.ColorPalette;
    var PanelColorSettings= blockEditor.PanelColorSettings;
    var PanelBody         = components.PanelBody;
    var TextControl       = components.TextControl;
    var TextareaControl   = components.TextareaControl;
    var ToggleControl     = components.ToggleControl;
    var Button            = components.Button;
    var SelectControl     = components.SelectControl;
    var RangeControl      = components.RangeControl;
    var Notice            = components.Notice;

    // ── Helpers ────────────────────────────────────────────────────
    function updateArr( arr, index, field, value ) {
        return arr.map( function(item, i) {
            return i === index ? Object.assign({}, item, { [field]: value }) : item;
        });
    }
    function removeArr( arr, index ) {
        return arr.filter( function(_, i){ return i !== index; });
    }

    // ── Bulk ingredient parser ─────────────────────────────────────
    // Accepts one ingredient per line. Tries to detect amount at start.
    // Examples:
    //   1½ cups / 360ml Whole milk
    //   🥛 1½ cups / 360ml Whole milk
    //   Whole milk – 1½ cups / 360ml
    //   1 cup sugar
    function parseBulkIngredients( text ) {
        var lines = text.split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
        return lines.map(function(line) {
            // Strip leading emoji if present
            var emoji = '🍴';
            var emojiMatch = line.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u);
            if (emojiMatch) {
                emoji = emojiMatch[1];
                line  = line.slice(emojiMatch[0].length).trim();
            }

            // Pattern: amount – name  OR  amount name  OR  name – amount
            var amtUS = ''; var amtMetric = ''; var name = line;

            // Try "name – amount" or "name: amount"
            var dashSplit = line.match(/^(.+?)\s*[–—:]\s*(.+)$/);

            // Try amount at start: digits/fractions/unicode fractions then unit then rest
            var frontAmt = line.match(/^([\d½⅓⅔¼¾⅛⅜⅝⅞\/\.\s]+(cups?|cup|tbsp|tsp|g|kg|ml|l|lb|oz|pinch|clove[s]?|piece[s]?|slice[s]?|handful|bunch|sprig[s]?)[\w]*\.?)\s+(.+)$/i);

            if (frontAmt) {
                var rawAmt = frontAmt[1].trim();
                name = frontAmt[3].trim();
                // Check if it has a metric part (e.g. "1½ cups / 360ml")
                var metricSplit = rawAmt.match(/^(.+?)\s*\/\s*(.+)$/);
                if (metricSplit) { amtUS = metricSplit[1].trim(); amtMetric = metricSplit[2].trim(); }
                else { amtUS = rawAmt; }
            } else if (dashSplit) {
                name = dashSplit[1].trim();
                var rawAmt2 = dashSplit[2].trim();
                var metricSplit2 = rawAmt2.match(/^(.+?)\s*\/\s*(.+)$/);
                if (metricSplit2) { amtUS = metricSplit2[1].trim(); amtMetric = metricSplit2[2].trim(); }
                else { amtUS = rawAmt2; }
            }

            return { emoji:emoji, name:name, amountUS:amtUS, amountMetric:amtMetric, sub:'', affiliateUrl:'' };
        });
    }

    // ── Bulk step parser ───────────────────────────────────────────
    // Accepts one step per line, or numbered list (1. Title: desc)
    // Examples:
    //   Blend everything until smooth
    //   1. Blend the base: Combine all ingredients and blend for 60 seconds.
    //   Step 1 — Blend: desc here
    function parseBulkSteps( text ) {
        var lines = text.split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
        return lines.map(function(line) {
            // Strip leading number: "1." "1)" "Step 1." "Step 1:"
            line = line.replace(/^(step\s*)?\d+[\.\)\-\:]\s*/i, '');

            // Try "Title: description" or "Title — description"
            var split = line.match(/^(.+?)\s*[:\-–—]\s+(.+)$/);
            if (split) {
                return { title: split[1].trim(), desc: split[2].trim(), tip:'', isMachine:false };
            }
            // No separator — whole line becomes the description, title auto-generated
            return { title: line.slice(0,40) + (line.length>40?'…':''), desc: line, tip:'', isMachine:false };
        });
    }

    // ── RECIPE CARD BLOCK ──────────────────────────────────────────
    registerBlockType( 'ohscoop/recipe-card', {
        title:       'OhScoop Recipe Card',
        description: 'Full-featured recipe card with schema, ratings, servings adjuster, US/Metric toggle, print, cook mode, and affiliate links.',
        category:    'common',
        icon:        'food',
        keywords:    ['ohscoop','recipe','gelato','ice cream','sorbet','frozen','ninja creami','food'],

        attributes: {
            title:          { type:'string',  default:'Recipe Title' },
            description:    { type:'string',  default:'' },
            recipeImage:    { type:'string',  default:'' },
            recipeImageId:  { type:'integer', default:0 },
            category:       { type:'string',  default:'Gelato' },
            cuisine:        { type:'string',  default:'Italian' },
            keywords:       { type:'string',  default:'' },
            showMachineBadge:{ type:'boolean',default:true },
            machineName:    { type:'string',  default:'Ninja Creami' },
            activePrep:     { type:'string',  default:'20 min' },
            freezeTime:     { type:'string',  default:'24 hr' },
            totalTime:      { type:'string',  default:'24 hr 20 min' },
            prepTimeISO:    { type:'string',  default:'PT20M' },
            cookTimeISO:    { type:'string',  default:'PT0M' },
            totalTimeISO:   { type:'string',  default:'PT24H20M' },
            difficulty:     { type:'string',  default:'Intermediate' },
            servings:       { type:'integer', default:2 },
            servingsUnit:   { type:'string',  default:'servings' },
            storage:        { type:'string',  default:'2 weeks' },
            season:         { type:'string',  default:'Year-round' },
            videoUrl:       { type:'string',  default:'' },
            equipment:      { type:'array',   default:[], items:{type:'object'} },
            ingredients:    { type:'array',   default:[
                {emoji:'🥛',name:'Whole milk',amountUS:'1½ cups',amountMetric:'360ml',sub:'',affiliateUrl:''},
                {emoji:'🍬',name:'Caster sugar',amountUS:'½ cup',amountMetric:'100g',sub:'',affiliateUrl:''},
            ], items:{type:'object'} },
            steps:          { type:'array',   default:[
                {title:'Blend the base',desc:'Combine all ingredients and blend until smooth.',tip:'',isMachine:false},
                {title:'Freeze solid',desc:'Freeze upright for minimum 24 hours.',tip:'Must be fully frozen.',isMachine:false},
            ], items:{type:'object'} },
            cal:            { type:'string',  default:'' },
            fat:            { type:'string',  default:'' },
            carbs:          { type:'string',  default:'' },
            protein:        { type:'string',  default:'' },
            sugar:          { type:'string',  default:'' },
            fibre:          { type:'string',  default:'' },
            sodium:         { type:'string',  default:'' },
            badges:         { type:'string',  default:'' },
            allergens:      { type:'string',  default:'' },
            ratingEnabled:  { type:'boolean', default:true },
            ratingValue:    { type:'number',  default:0 },
            ratingCount:    { type:'integer', default:0 },
            showUnitToggle: { type:'boolean', default:true },
            showPrintButton:{ type:'boolean', default:true },
            showCookMode:   { type:'boolean', default:true },
            accentColor:    { type:'string',  default:'#7c3aed' },
            headerGradient: { type:'string',  default:'linear-gradient(135deg,#2d1052 0%,#1a3a1a 100%)' },
        },

        edit: function( props ) {
            var a      = props.attributes;
            var setA   = props.setAttributes;
            var accent = a.accentColor || '#7c3aed';

            var blockProps = useBlockProps({ className: 'ohscoop-editor-wrap' });

            // ── Bulk import state
            var bulkIngState  = useState(false);  // [show, setShow]
            var showBulkIng   = bulkIngState[0];
            var setShowBulkIng= bulkIngState[1];
            var bulkIngText   = useState('')[0];
            var setBulkIngText= useState('')[1];

            var bulkStepState  = useState(false);
            var showBulkStep   = bulkStepState[0];
            var setShowBulkStep= bulkStepState[1];
            var bulkStepText   = useState('')[0];
            var setBulkStepText= useState('')[1];

            // Proper useState pairs
            var _bingState = useState('');
            var bulkIngVal = _bingState[0]; var setBulkIngVal = _bingState[1];
            var _bstepState = useState('');
            var bulkStepVal = _bstepState[0]; var setBulkStepVal = _bstepState[1];
            var _showIngState = useState(false);
            var showBulkIngPanel = _showIngState[0]; var setShowBulkIngPanel = _showIngState[1];
            var _showStepState = useState(false);
            var showBulkStepPanel = _showStepState[0]; var setShowBulkStepPanel = _showStepState[1];

            // ── Ingredient helpers
            function updIng(i,f,v){ setA({ingredients: updateArr(a.ingredients,i,f,v)}); }
            function addIng(){ setA({ingredients: a.ingredients.concat([{emoji:'🍴',name:'New ingredient',amountUS:'',amountMetric:'',sub:'',affiliateUrl:''}])}); }
            function remIng(i){ setA({ingredients: removeArr(a.ingredients,i)}); }

            // ── Step helpers
            function updStep(i,f,v){ setA({steps: updateArr(a.steps,i,f,v)}); }
            function addStep(){ setA({steps: a.steps.concat([{title:'New step',desc:'Describe this step...',tip:'',isMachine:false}])}); }
            function remStep(i){ setA({steps: removeArr(a.steps,i)}); }

            // ── Equipment helpers
            function updEq(i,f,v){ setA({equipment: updateArr(a.equipment,i,f,v)}); }
            function addEq(){ setA({equipment: a.equipment.concat([{name:'',affiliateUrl:''}])}); }
            function remEq(i){ setA({equipment: removeArr(a.equipment,i)}); }

            return el( Fragment, null,

                // ════════════════════════════════════════════════
                // SIDEBAR PANELS
                // ════════════════════════════════════════════════
                el( InspectorControls, null,

                    // ── Basic info
                    el( PanelBody, { title:'📝 Recipe Info', initialOpen:true },
                        el( TextControl, { label:'Category (e.g. Gelato, Ice Cream, Cake)', value:a.category, onChange:function(v){setA({category:v});} }),
                        el( TextControl, { label:'Cuisine (e.g. Italian, American)', value:a.cuisine, onChange:function(v){setA({cuisine:v});} }),
                        el( TextControl, { label:'Keywords (comma-separated, for SEO)', value:a.keywords, onChange:function(v){setA({keywords:v});} }),
                        el( SelectControl, { label:'Difficulty', value:a.difficulty,
                            options:[{label:'Beginner',value:'Beginner'},{label:'Intermediate',value:'Intermediate'},{label:'Advanced',value:'Advanced'}],
                            onChange:function(v){setA({difficulty:v});} }),
                        el( TextControl, { label:'Servings unit (e.g. servings, pints)', value:a.servingsUnit, onChange:function(v){setA({servingsUnit:v});} }),
                        el( TextControl, { label:'Storage life', value:a.storage, onChange:function(v){setA({storage:v});} }),
                        el( TextControl, { label:'Best season', value:a.season, onChange:function(v){setA({season:v});} }),
                    ),

                    // ── Machine badge
                    el( PanelBody, { title:'⚡ Machine Badge', initialOpen:false },
                        el( ToggleControl, { label:'Show machine badge', checked:a.showMachineBadge, onChange:function(v){setA({showMachineBadge:v});} }),
                        a.showMachineBadge && el( TextControl, { label:'Machine name', value:a.machineName, onChange:function(v){setA({machineName:v});} }),
                    ),

                    // ── Time & ISO
                    el( PanelBody, { title:'⏱️ Times & Schema', initialOpen:false },
                        el( 'p', { style:{fontSize:12,color:'#666',margin:'0 0 8px'} }, 'Display times are edited inline on the card. ISO times are for Google Schema (e.g. PT20M = 20 min, PT1H30M = 1h 30min, PT24H = 24 hours).'),
                        el( TextControl, { label:'Prep time (ISO 8601)', value:a.prepTimeISO, onChange:function(v){setA({prepTimeISO:v});} }),
                        el( TextControl, { label:'Cook/Freeze time (ISO 8601)', value:a.cookTimeISO, onChange:function(v){setA({cookTimeISO:v});} }),
                        el( TextControl, { label:'Total time (ISO 8601)', value:a.totalTimeISO, onChange:function(v){setA({totalTimeISO:v});} }),
                    ),

                    // ── Video
                    el( PanelBody, { title:'📹 Video', initialOpen:false },
                        el( TextControl, { label:'YouTube / video URL', value:a.videoUrl, onChange:function(v){setA({videoUrl:v});}, placeholder:'https://youtube.com/watch?v=...' }),
                    ),

                    // ── Nutrition
                    el( PanelBody, { title:'📊 Nutrition (per serving)', initialOpen:false },
                        el( TextControl, { label:'Calories',  value:a.cal,     onChange:function(v){setA({cal:v});},     placeholder:'310 kcal' }),
                        el( TextControl, { label:'Fat',       value:a.fat,     onChange:function(v){setA({fat:v});},     placeholder:'14g' }),
                        el( TextControl, { label:'Carbs',     value:a.carbs,   onChange:function(v){setA({carbs:v});},   placeholder:'38g' }),
                        el( TextControl, { label:'Protein',   value:a.protein, onChange:function(v){setA({protein:v});}, placeholder:'9g' }),
                        el( TextControl, { label:'Sugar',     value:a.sugar,   onChange:function(v){setA({sugar:v});},   placeholder:'34g' }),
                        el( TextControl, { label:'Fibre',     value:a.fibre,   onChange:function(v){setA({fibre:v});},   placeholder:'2g' }),
                        el( TextControl, { label:'Sodium',    value:a.sodium,  onChange:function(v){setA({sodium:v});},  placeholder:'45mg' }),
                    ),

                    // ── Dietary
                    el( PanelBody, { title:'🏷️ Dietary & Allergens', initialOpen:false },
                        el( TextControl, { label:'Badges (comma-separated)', value:a.badges, onChange:function(v){setA({badges:v});}, placeholder:'Gluten-free, Vegetarian' }),
                        el( TextControl, { label:'Allergen warning', value:a.allergens, onChange:function(v){setA({allergens:v});} }),
                    ),

                    // ── Rating
                    el( PanelBody, { title:'⭐ Star Rating', initialOpen:false },
                        el( ToggleControl, { label:'Enable star rating', checked:a.ratingEnabled, onChange:function(v){setA({ratingEnabled:v});} }),
                        el( 'p', { style:{fontSize:12,color:'#666'} }, 'Ratings update via AJAX when visitors rate. You can manually set an initial value below.' ),
                        el( TextControl, { label:'Rating value (0-5)', value:String(a.ratingValue), onChange:function(v){setA({ratingValue:parseFloat(v)||0});} }),
                        el( TextControl, { label:'Rating count',       value:String(a.ratingCount), onChange:function(v){setA({ratingCount:parseInt(v)||0});} }),
                    ),

                    // ── Display options
                    el( PanelBody, { title:'🎛️ Display Options', initialOpen:false },
                        el( ToggleControl, { label:'US / Metric toggle', checked:a.showUnitToggle,  onChange:function(v){setA({showUnitToggle:v});} }),
                        el( ToggleControl, { label:'Print button',        checked:a.showPrintButton, onChange:function(v){setA({showPrintButton:v});} }),
                        el( ToggleControl, { label:'Cook mode button',    checked:a.showCookMode,    onChange:function(v){setA({showCookMode:v});} }),
                    ),

                    // ── Colours
                    el( PanelBody, { title:'🎨 Colours', initialOpen:false },
                        el( 'p', { style:{fontSize:12,fontWeight:500,marginBottom:8} }, 'Accent colour' ),
                        el( ColorPalette, {
                            value: a.accentColor,
                            onChange: function(v){ setA({accentColor:v||'#7c3aed'}); },
                            colors: [
                                {name:'Purple (default)', color:'#7c3aed'},
                                {name:'Teal',  color:'#0d9488'},
                                {name:'Rose',  color:'#e11d48'},
                                {name:'Amber', color:'#d97706'},
                                {name:'Blue',  color:'#2563eb'},
                                {name:'Green', color:'#16a34a'},
                            ]
                        }),
                    ),
                ),

                // ════════════════════════════════════════════════
                // BLOCK CANVAS
                // ════════════════════════════════════════════════
                el( 'div', blockProps,
                    el( 'div', { className:'ohscoop-wrap ohscoop-editor', style:{'--ohscoop-accent':accent} },

                        // ── Editor notice
                        el( 'div', { className:'ohscoop-editor-notice' },
                            '✏️ Click any field to edit inline. Use the sidebar panels for SEO, nutrition, colours & more.'
                        ),

                        // ── Image upload
                        el( 'div', { className:'ohscoop-image-area' },
                            el( MediaUploadCheck, null,
                                el( MediaUpload, {
                                    onSelect: function(media){ setA({recipeImage:media.url, recipeImageId:media.id}); },
                                    allowedTypes: ['image'],
                                    value: a.recipeImageId,
                                    render: function(obj) {
                                        return el( 'div', null,
                                            a.recipeImage
                                                ? el( 'div', { className:'ohscoop-img-preview', style:{backgroundImage:'url('+a.recipeImage+')'} },
                                                    el( Button, { isSmall:true, isSecondary:true, onClick:obj.open }, '🖼 Change image' ),
                                                    el( Button, { isSmall:true, isDestructive:true, onClick:function(){setA({recipeImage:'',recipeImageId:0});} }, '✕ Remove' )
                                                  )
                                                : el( Button, { className:'ohscoop-img-placeholder', onClick:obj.open },
                                                    el('span',null,'📷 Add recipe photo (recommended for Google rich results)')
                                                  )
                                        );
                                    }
                                })
                            )
                        ),

                        // ── Header
                        el( 'div', { className:'ohscoop-header', style:{background:a.headerGradient} },
                            el( 'div', { className:'ohscoop-header-content' },
                                el( 'div', { className:'ohscoop-header-meta' },
                                    el( 'span', { className:'ohscoop-label' }, a.category + (a.cuisine?' · '+a.cuisine:'') ),
                                    a.showMachineBadge && el( 'span', { className:'ohscoop-machine-pill' }, '⚡ ' + a.machineName ),
                                ),
                                el( RichText, { tagName:'h2', className:'ohscoop-title', value:a.title, onChange:function(v){setA({title:v});}, placeholder:'Recipe title...', allowedFormats:[] }),
                                el( RichText, { tagName:'p', className:'ohscoop-desc', value:a.description, onChange:function(v){setA({description:v});}, placeholder:'Short description (also used in Google schema)...', allowedFormats:[] }),
                            )
                        ),

                        // ── Info grid
                        el( 'div', { className:'ohscoop-info-grid' },
                            el( 'div', { className:'ohscoop-info-card' },
                                el('div',{className:'ohscoop-info-icon'},'⏱️'),
                                el( RichText, {tagName:'div',className:'ohscoop-info-val',value:a.activePrep,onChange:function(v){setA({activePrep:v});},placeholder:'20 min',allowedFormats:[]}),
                                el('div',{className:'ohscoop-info-label'},'Active prep')
                            ),
                            el( 'div', { className:'ohscoop-info-card' },
                                el('div',{className:'ohscoop-info-icon'},'❄️'),
                                el( RichText, {tagName:'div',className:'ohscoop-info-val',value:a.freezeTime,onChange:function(v){setA({freezeTime:v});},placeholder:'24 hr',allowedFormats:[]}),
                                el('div',{className:'ohscoop-info-label'},'Freeze / Cook')
                            ),
                            el( 'div', { className:'ohscoop-info-card' },
                                el('div',{className:'ohscoop-info-icon'},'🕐'),
                                el( RichText, {tagName:'div',className:'ohscoop-info-val',value:a.totalTime,onChange:function(v){setA({totalTime:v});},placeholder:'24 hr 20 min',allowedFormats:[]}),
                                el('div',{className:'ohscoop-info-label'},'Total time')
                            ),
                            el( 'div', { className:'ohscoop-info-card' },
                                el('div',{className:'ohscoop-info-icon'},'📊'),
                                el('div',{className:'ohscoop-info-val'},a.difficulty),
                                el('div',{className:'ohscoop-info-label'},'Difficulty')
                            ),
                            el( 'div', { className:'ohscoop-info-card' },
                                el('div',{className:'ohscoop-info-icon'},'🍽️'),
                                el( RichText, {tagName:'div',className:'ohscoop-info-val',value:String(a.servings),onChange:function(v){setA({servings:parseInt(v)||1});},allowedFormats:[]}),
                                el('div',{className:'ohscoop-info-label'},a.servingsUnit)
                            ),
                            el( 'div', { className:'ohscoop-info-card' },
                                el('div',{className:'ohscoop-info-icon'},'📅'),
                                el('div',{className:'ohscoop-info-val'},a.storage),
                                el('div',{className:'ohscoop-info-label'},'Storage')
                            ),
                            el( 'div', { className:'ohscoop-info-card' },
                                el('div',{className:'ohscoop-info-icon'},'🌸'),
                                el('div',{className:'ohscoop-info-val'},a.season),
                                el('div',{className:'ohscoop-info-label'},'Best season')
                            ),
                        ),

                        // ── Equipment
                        el( 'div', { className:'ohscoop-section-title' }, '🍴 Equipment'),
                        el( 'div', { className:'ohscoop-equipment-editor' },
                            a.equipment.map( function(eq,i) {
                                return el( 'div', { key:i, className:'ohscoop-eq-row' },
                                    el( RichText, {tagName:'span',className:'ohscoop-eq-name',value:eq.name,onChange:function(v){updEq(i,'name',v);},placeholder:'Equipment name...',allowedFormats:[]}),
                                    el( 'input', { type:'url', className:'ohscoop-eq-url', value:eq.affiliateUrl||'', placeholder:'Affiliate URL (optional)',
                                        onChange:function(e){updEq(i,'affiliateUrl',e.target.value);} }),
                                    el( Button, {isSmall:true,isDestructive:true,onClick:function(){remEq(i);},icon:'trash'})
                                );
                            }),
                            el( Button, {className:'ohscoop-add-btn',isSecondary:true,onClick:addEq}, '+ Add equipment')
                        ),

                        // ── Ingredients
                        el( 'div', { className:'ohscoop-section-title' },
                            'Ingredients',
                            el( Button, {
                                className: 'ohscoop-bulk-toggle-btn',
                                isSmall: true,
                                isSecondary: true,
                                onClick: function(){ setShowBulkIngPanel(!showBulkIngPanel); setBulkIngVal(''); },
                                style: { marginLeft:'auto', fontSize:11 }
                            }, showBulkIngPanel ? '✕ Cancel bulk' : '⚡ Bulk add' )
                        ),

                        // Bulk ingredient panel
                        showBulkIngPanel && el( 'div', { className:'ohscoop-bulk-panel' },
                            el( 'p', { className:'ohscoop-bulk-hint' },
                                'Paste one ingredient per line. Detected formats:',
                                el('br'),
                                el('code',null,'1½ cups / 360ml Whole milk'),
                                el('br'),
                                el('code',null,'🥛 ½ cup Sugar'),
                                el('br'),
                                el('code',null,'Cream cheese – 2 tbsp / 30g'),
                                el('br'),
                                el('code',null,'Vanilla extract'),
                            ),
                            el( 'textarea', {
                                className: 'ohscoop-bulk-textarea',
                                placeholder: '1½ cups / 360ml Whole milk\n🥛 ½ cup Sugar\nCream cheese – 2 tbsp / 30g\nVanilla extract\n...',
                                rows: 8,
                                value: bulkIngVal,
                                onChange: function(e){ setBulkIngVal(e.target.value); }
                            }),
                            el( 'div', { className:'ohscoop-bulk-actions' },
                                el( Button, {
                                    isPrimary: true,
                                    onClick: function() {
                                        if (!bulkIngVal.trim()) return;
                                        var parsed = parseBulkIngredients(bulkIngVal);
                                        setA({ ingredients: a.ingredients.concat(parsed) });
                                        setBulkIngVal('');
                                        setShowBulkIngPanel(false);
                                    }
                                }, '✅ Add ' + (bulkIngVal.trim() ? bulkIngVal.trim().split('\n').filter(Boolean).length : 0) + ' ingredients'),
                                el( Button, {
                                    isDestructive: true,
                                    isSecondary: true,
                                    onClick: function() {
                                        if (!bulkIngVal.trim()) return;
                                        var parsed = parseBulkIngredients(bulkIngVal);
                                        setA({ ingredients: parsed });
                                        setBulkIngVal('');
                                        setShowBulkIngPanel(false);
                                    }
                                }, '🔄 Replace all ingredients'),
                            )
                        ),

                        el( 'ul', { className:'ohscoop-ing-list' },
                            a.ingredients.map( function(ing,i) {
                                return el( 'li', { key:i, className:'ohscoop-ing-item ohscoop-ing-editor-row' },
                                    el( RichText, {tagName:'span',className:'ohscoop-ing-emoji',value:ing.emoji,onChange:function(v){updIng(i,'emoji',v);},allowedFormats:[]}),
                                    el( 'div', { className:'ohscoop-ing-name' },
                                        el( RichText, {tagName:'div',value:ing.name,onChange:function(v){updIng(i,'name',v);},placeholder:'Ingredient name...',allowedFormats:[]}),
                                        el( RichText, {tagName:'div',className:'ohscoop-ing-note',value:ing.sub,onChange:function(v){updIng(i,'sub',v);},placeholder:'Substitution (optional)',allowedFormats:[]}),
                                        el( 'input', {type:'url',className:'ohscoop-aff-url',value:ing.affiliateUrl||'',placeholder:'Affiliate link URL (optional)',onChange:function(e){updIng(i,'affiliateUrl',e.target.value);}})
                                    ),
                                    el( 'div', { className:'ohscoop-ing-amounts' },
                                        el( RichText, {tagName:'div',className:'ohscoop-ing-amount',value:ing.amountUS,onChange:function(v){updIng(i,'amountUS',v);},placeholder:'US amt',allowedFormats:[]}),
                                        el( RichText, {tagName:'div',className:'ohscoop-ing-amount ohscoop-metric-val',value:ing.amountMetric,onChange:function(v){updIng(i,'amountMetric',v);},placeholder:'Metric',allowedFormats:[]}),
                                    ),
                                    el( Button, {isSmall:true,isDestructive:true,onClick:function(){remIng(i);},icon:'trash'})
                                );
                            }),
                            el( Button, {className:'ohscoop-add-btn',isSecondary:true,onClick:addIng}, '+ Add ingredient')
                        ),

                        // ── Steps
                        el( 'div', { className:'ohscoop-section-title' },
                            'Method — ' + a.steps.length + ' Steps',
                            el( Button, {
                                className: 'ohscoop-bulk-toggle-btn',
                                isSmall: true,
                                isSecondary: true,
                                onClick: function(){ setShowBulkStepPanel(!showBulkStepPanel); setBulkStepVal(''); },
                                style: { marginLeft:'auto', fontSize:11 }
                            }, showBulkStepPanel ? '✕ Cancel bulk' : '⚡ Bulk add' )
                        ),

                        // Bulk steps panel
                        showBulkStepPanel && el( 'div', { className:'ohscoop-bulk-panel' },
                            el( 'p', { className:'ohscoop-bulk-hint' },
                                'Paste one step per line. Detected formats:',
                                el('br'),
                                el('code',null,'1. Blend the base: Combine all ingredients and blend.'),
                                el('br'),
                                el('code',null,'Blend the base — Combine all ingredients.'),
                                el('br'),
                                el('code',null,'Freeze solid'),
                                el('br'),
                                'Steps without a colon or dash will use the first 40 characters as the title.'
                            ),
                            el( 'textarea', {
                                className: 'ohscoop-bulk-textarea',
                                placeholder: '1. Blend the base: Combine all ingredients and blend for 60 seconds.\n2. Strain: Pour through a sieve.\n3. Fill the pint container: Pour to the max fill line.\n4. Freeze solid: Freeze upright for 24 hours.\n5. Temper: Rest on counter for 5 minutes.\n6. Process — Gelato cycle: Select GELATO and press Start.\n7. Check texture: Re-spin if crumbly.\n8. Add mix-ins: Create a channel and add toppings.\n9. Serve: Scoop into chilled bowls.\n10. Store: Return to freezer, re-spin to serve again.',
                                rows: 10,
                                value: bulkStepVal,
                                onChange: function(e){ setBulkStepVal(e.target.value); }
                            }),
                            el( 'div', { className:'ohscoop-bulk-actions' },
                                el( Button, {
                                    isPrimary: true,
                                    onClick: function() {
                                        if (!bulkStepVal.trim()) return;
                                        var parsed = parseBulkSteps(bulkStepVal);
                                        setA({ steps: a.steps.concat(parsed) });
                                        setBulkStepVal('');
                                        setShowBulkStepPanel(false);
                                    }
                                }, '✅ Add ' + (bulkStepVal.trim() ? bulkStepVal.trim().split('\n').filter(Boolean).length : 0) + ' steps'),
                                el( Button, {
                                    isDestructive: true,
                                    isSecondary: true,
                                    onClick: function() {
                                        if (!bulkStepVal.trim()) return;
                                        var parsed = parseBulkSteps(bulkStepVal);
                                        setA({ steps: parsed });
                                        setBulkStepVal('');
                                        setShowBulkStepPanel(false);
                                    }
                                }, '🔄 Replace all steps'),
                            )
                        ),

                        el( 'ul', { className:'ohscoop-steps' },
                            a.steps.map( function(step,i) {
                                return el( 'li', { key:i, className:'ohscoop-step' },
                                    el( 'div', { className:'ohscoop-step-num ' + (step.isMachine?'ohscoop-step-machine':'') }, i+1),
                                    el( 'div', { className:'ohscoop-step-body' },
                                        el( 'div', { className:'ohscoop-step-editor-header' },
                                            el( RichText, {tagName:'div',className:'ohscoop-step-title-edit',value:step.title,onChange:function(v){updStep(i,'title',v);},placeholder:'Step title...',allowedFormats:[]}),
                                            el( ToggleControl, {label:a.machineName+' step',checked:!!step.isMachine,onChange:function(v){updStep(i,'isMachine',v);}}),
                                            el( Button, {isSmall:true,isDestructive:true,onClick:function(){remStep(i);},icon:'trash'})
                                        ),
                                        el( RichText, {tagName:'div',className:'ohscoop-step-desc',value:step.desc,onChange:function(v){updStep(i,'desc',v);},placeholder:'Describe this step...',allowedFormats:[]}),
                                        el( RichText, {tagName:'div',className:'ohscoop-step-tip-edit',value:step.tip,onChange:function(v){updStep(i,'tip',v);},placeholder:'💡 Pro tip (optional)...',allowedFormats:[]}),
                                    )
                                );
                            }),
                            el( Button, {className:'ohscoop-add-btn',isSecondary:true,onClick:addStep}, '+ Add step')
                        ),

                        // ── Nutrition preview
                        el( 'div', { className:'ohscoop-section-title' }, 'Nutrition · edit in sidebar →'),
                        el( 'div', { className:'ohscoop-nutrition-grid' },
                            [['cal','Calories'],['fat','Fat'],['carbs','Carbs'],['protein','Protein'],['sugar','Sugars'],['fibre','Fibre'],['sodium','Sodium']].map(function(pair){
                                return a[pair[0]] ? el('div',{key:pair[0],className:'ohscoop-nut-card'},
                                    el('div',{className:'ohscoop-nut-val'},a[pair[0]]),
                                    el('div',{className:'ohscoop-nut-label'},pair[1])
                                ) : null;
                            })
                        ),

                        // ── Badges
                        el( 'div', { className:'ohscoop-badges' },
                            (a.badges||'').split(',').map(function(b,i){
                                b=b.trim(); return b?el('span',{key:i,className:'ohscoop-badge'},'✓ '+b):null;
                            })
                        ),
                        a.allergens && el('div',{className:'ohscoop-allergens'},'⚠️ '+a.allergens),

                    ) // .ohscoop-wrap
                ) // blockProps
            ); // Fragment
        },

        save: function() { return null; }, // server-side rendered
    });

    // ════════════════════════════════════════════════════════════════
    // JUMP TO RECIPE BLOCK
    // ════════════════════════════════════════════════════════════════
    registerBlockType( 'ohscoop/jump-to-recipe', {
        title:    'OhScoop: Jump to Recipe',
        description: 'A "Jump to Recipe" button — place this at the top of your post, above the recipe card.',
        category: 'common',
        icon:     'arrow-down',
        keywords: ['ohscoop','jump','recipe','button'],
        attributes: {
            label:       { type:'string', default:'⬇ Jump to Recipe' },
            accentColor: { type:'string', default:'#7c3aed' },
        },
        edit: function(props) {
            var a   = props.attributes;
            var setA= props.setAttributes;
            var bp  = useBlockProps({className:'ohscoop-jump-editor'});
            return el( 'div', bp,
                el( 'div', { className:'ohscoop-jump-wrap' },
                    el( 'span', { className:'ohscoop-jump-btn', style:{background:a.accentColor||'#7c3aed'} }, a.label )
                ),
                el( 'div', { className:'ohscoop-jump-controls' },
                    el( TextControl, { label:'Button label', value:a.label, onChange:function(v){setA({label:v});} }),
                )
            );
        },
        save: function() { return null; },
    });

} )( window.wp.blocks, window.wp.element, window.wp.blockEditor, window.wp.components );
