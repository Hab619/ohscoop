<?php
/**
 * Plugin Name:       OhScoop — Recipe Card Block
 * Plugin URI:        https://cybertrickz.info/ohscoop
 * Description:       A beautiful Gutenberg recipe card block for frozen desserts and any recipe type. Includes Schema markup, star ratings, adjustable servings, US/Metric toggle, print mode, cook mode, affiliate links, and more.
 * Version:           2.1.0
 * Author:            cybertrickz
 * Author URI:        https://cybertrickz.info
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       ohscoop-recipe-card
 * Requires at least: 6.0
 * Requires PHP:      7.4
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'OHSCOOP_VERSION', '2.1.0' );
define( 'OHSCOOP_DIR', plugin_dir_path( __FILE__ ) );
define( 'OHSCOOP_URL', plugin_dir_url( __FILE__ ) );

// ── Include modules ────────────────────────────────────────────────
require_once OHSCOOP_DIR . 'includes/schema.php';
require_once OHSCOOP_DIR . 'includes/jump-button.php';

// ── Register block ─────────────────────────────────────────────────
function ohscoop_register_block() {

    wp_register_script(
        'ohscoop-block-editor',
        OHSCOOP_URL . 'build/block.js',
        [ 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n', 'wp-hooks' ],
        OHSCOOP_VERSION,
        true
    );

    wp_register_style(
        'ohscoop-editor-style',
        OHSCOOP_URL . 'build/editor.css',
        [ 'wp-edit-blocks' ],
        OHSCOOP_VERSION
    );

    wp_register_style(
        'ohscoop-frontend-style',
        OHSCOOP_URL . 'build/style.css',
        [],
        OHSCOOP_VERSION
    );

    register_block_type( 'ohscoop/recipe-card', [
        'editor_script'   => 'ohscoop-block-editor',
        'editor_style'    => 'ohscoop-editor-style',
        'style'           => 'ohscoop-frontend-style',
        'render_callback' => 'ohscoop_render_block',
        'attributes'      => ohscoop_get_attributes(),
    ] );
}
add_action( 'init', 'ohscoop_register_block' );

// ── Enqueue frontend JS ────────────────────────────────────────────
function ohscoop_enqueue_frontend() {
    if ( ! is_singular() ) return;
    wp_enqueue_script(
        'ohscoop-frontend',
        OHSCOOP_URL . 'build/frontend.js',
        [],
        OHSCOOP_VERSION,
        true
    );
}
add_action( 'wp_enqueue_scripts', 'ohscoop_enqueue_frontend' );

// ── Attributes definition ──────────────────────────────────────────
function ohscoop_get_attributes() {
    return [
        // Basic
        'title'         => [ 'type' => 'string',  'default' => 'Recipe Title' ],
        'description'   => [ 'type' => 'string',  'default' => '' ],
        'recipeImage'   => [ 'type' => 'string',  'default' => '' ],
        'recipeImageId' => [ 'type' => 'integer', 'default' => 0 ],
        'category'      => [ 'type' => 'string',  'default' => 'Gelato' ],
        'cuisine'       => [ 'type' => 'string',  'default' => 'Italian' ],
        'keywords'      => [ 'type' => 'string',  'default' => '' ],
        // Machine badge
        'showMachineBadge' => [ 'type' => 'boolean', 'default' => true ],
        'machineName'      => [ 'type' => 'string',  'default' => 'Ninja Creami' ],
        // Times
        'activePrep'    => [ 'type' => 'string',  'default' => '20 min' ],
        'freezeTime'    => [ 'type' => 'string',  'default' => '24 hr' ],
        'totalTime'     => [ 'type' => 'string',  'default' => '24 hr 20 min' ],
        'prepTimeISO'   => [ 'type' => 'string',  'default' => 'PT20M' ],
        'cookTimeISO'   => [ 'type' => 'string',  'default' => 'PT0M' ],
        'totalTimeISO'  => [ 'type' => 'string',  'default' => 'PT24H20M' ],
        // Details
        'difficulty'    => [ 'type' => 'string',  'default' => 'Intermediate' ],
        'servings'      => [ 'type' => 'integer', 'default' => 2 ],
        'servingsUnit'  => [ 'type' => 'string',  'default' => 'servings' ],
        'storage'       => [ 'type' => 'string',  'default' => '2 weeks' ],
        'season'        => [ 'type' => 'string',  'default' => 'Year-round' ],
        // Video
        'videoUrl'      => [ 'type' => 'string',  'default' => '' ],
        // Equipment
        'equipment'     => [ 'type' => 'array',   'default' => [], 'items' => [ 'type' => 'object' ] ],
        // Ingredients
        'ingredients'   => [ 'type' => 'array',   'default' => [
            [ 'emoji' => '🥛', 'name' => 'Whole milk',    'amountUS' => '1½ cups', 'amountMetric' => '360ml', 'sub' => '', 'affiliateUrl' => '' ],
            [ 'emoji' => '🍬', 'name' => 'Caster sugar',  'amountUS' => '½ cup',   'amountMetric' => '100g',  'sub' => '', 'affiliateUrl' => '' ],
        ], 'items' => [ 'type' => 'object' ] ],
        // Steps
        'steps'         => [ 'type' => 'array',   'default' => [
            [ 'title' => 'Blend the base', 'desc' => 'Combine all ingredients and blend until smooth.', 'tip' => '', 'isMachine' => false ],
            [ 'title' => 'Freeze solid',   'desc' => 'Freeze upright for minimum 24 hours.', 'tip' => 'Must be fully frozen.', 'isMachine' => false ],
        ], 'items' => [ 'type' => 'object' ] ],
        // Nutrition
        'cal'           => [ 'type' => 'string',  'default' => '' ],
        'fat'           => [ 'type' => 'string',  'default' => '' ],
        'carbs'         => [ 'type' => 'string',  'default' => '' ],
        'protein'       => [ 'type' => 'string',  'default' => '' ],
        'sugar'         => [ 'type' => 'string',  'default' => '' ],
        'fibre'         => [ 'type' => 'string',  'default' => '' ],
        'sodium'        => [ 'type' => 'string',  'default' => '' ],
        // Dietary
        'badges'        => [ 'type' => 'string',  'default' => '' ],
        'allergens'     => [ 'type' => 'string',  'default' => '' ],
        // Rating
        'ratingEnabled' => [ 'type' => 'boolean', 'default' => true ],
        'ratingValue'   => [ 'type' => 'number',  'default' => 0 ],
        'ratingCount'   => [ 'type' => 'integer', 'default' => 0 ],
        // Display options
        'showUnitToggle'    => [ 'type' => 'boolean', 'default' => true ],
        'showPrintButton'   => [ 'type' => 'boolean', 'default' => true ],
        'showCookMode'      => [ 'type' => 'boolean', 'default' => true ],
        'accentColor'       => [ 'type' => 'string',  'default' => '#7c3aed' ],
        'headerGradient'    => [ 'type' => 'string',  'default' => 'linear-gradient(135deg, #2d1052 0%, #1a3a1a 100%)' ],
    ];
}

// ── Server-side render ─────────────────────────────────────────────
function ohscoop_render_block( $a ) {
    $post_id    = get_the_ID();
    $accent     = esc_attr( $a['accentColor'] ?? '#7c3aed' );
    $gradient   = esc_attr( $a['headerGradient'] ?? 'linear-gradient(135deg,#2d1052 0%,#1a3a1a 100%)' );
    $servings   = intval( $a['servings'] ?? 2 );
    $unit       = esc_html( $a['servingsUnit'] ?? 'servings' );
    $machine    = esc_html( $a['machineName'] ?? 'Ninja Creami' );
    $showMachine= !empty( $a['showMachineBadge'] );
    $ingredients= $a['ingredients'] ?? [];
    $steps      = $a['steps'] ?? [];
    $equipment  = $a['equipment'] ?? [];
    $video      = esc_url( $a['videoUrl'] ?? '' );
    $img        = esc_url( $a['recipeImage'] ?? '' );

    // Schema output
    ohscoop_output_schema( $a, $post_id );

    ob_start();
    ?>
    <div class="ohscoop-wrap" id="ohscoop-<?php echo $post_id; ?>"
         style="--ohscoop-accent:<?php echo $accent; ?>; --ohscoop-gradient:<?php echo $gradient; ?>;"
         data-servings="<?php echo $servings; ?>"
         data-unit="<?php echo esc_attr($unit); ?>">

        <?php // ── Toolbar ──────────────────────────────────────── ?>
        <div class="ohscoop-toolbar">
            <?php if ( !empty($a['showUnitToggle']) ) : ?>
            <div class="ohscoop-unit-toggle" role="group" aria-label="Unit toggle">
                <button class="ohscoop-unit-btn active" data-unit="us" onclick="ohscoopSetUnit(this,'us')">US</button>
                <button class="ohscoop-unit-btn" data-unit="metric" onclick="ohscoopSetUnit(this,'metric')">Metric</button>
            </div>
            <?php endif; ?>
            <div class="ohscoop-toolbar-right">
                <?php if ( !empty($a['showCookMode']) ) : ?>
                <button class="ohscoop-icon-btn" id="ohscoop-cookmode-<?php echo $post_id; ?>" onclick="ohscoopCookMode(this)" title="Cook Mode — keeps screen awake">
                    🍳 <span>Cook Mode</span>
                </button>
                <?php endif; ?>
                <?php if ( !empty($a['showPrintButton']) ) : ?>
                <button class="ohscoop-icon-btn" onclick="window.print()" title="Print recipe">
                    🖨️ <span>Print</span>
                </button>
                <?php endif; ?>
            </div>
        </div>

        <?php // ── Header ───────────────────────────────────────── ?>
        <div class="ohscoop-header" style="background:<?php echo $gradient; ?>">
            <?php if ( $img ) : ?>
            <div class="ohscoop-header-img" style="background-image:url('<?php echo $img; ?>')"></div>
            <?php endif; ?>
            <div class="ohscoop-header-content">
                <div class="ohscoop-header-meta">
                    <span class="ohscoop-label">
                        <?php echo esc_html( $a['category'] ?? 'Recipe' ); ?>
                        <?php if ( !empty($a['cuisine']) ) echo ' · ' . esc_html($a['cuisine']); ?>
                    </span>
                    <?php if ( $showMachine ) : ?>
                    <span class="ohscoop-machine-pill">⚡ <?php echo $machine; ?></span>
                    <?php endif; ?>
                </div>
                <h2 class="ohscoop-title"><?php echo esc_html( $a['title'] ); ?></h2>
                <?php if ( !empty($a['description']) ) : ?>
                <p class="ohscoop-desc"><?php echo esc_html( $a['description'] ); ?></p>
                <?php endif; ?>

                <?php // Star rating display
                if ( !empty($a['ratingEnabled']) ) :
                    $rating = floatval( $a['ratingValue'] ?? 0 );
                    $count  = intval( $a['ratingCount'] ?? 0 );
                ?>
                <div class="ohscoop-rating-display" itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
                    <div class="ohscoop-stars-display">
                        <?php for ( $i = 1; $i <= 5; $i++ ) :
                            $cls = $i <= round($rating) ? 'star-filled' : 'star-empty';
                        ?>
                        <span class="ohscoop-star <?php echo $cls; ?>">★</span>
                        <?php endfor; ?>
                    </div>
                    <?php if ( $count > 0 ) : ?>
                    <span class="ohscoop-rating-text">
                        <span itemprop="ratingValue"><?php echo number_format($rating,1); ?></span>/5
                        (<span itemprop="ratingCount"><?php echo $count; ?></span> ratings)
                    </span>
                    <?php else : ?>
                    <span class="ohscoop-rating-text">Be the first to rate!</span>
                    <?php endif; ?>
                </div>
                <?php endif; ?>
            </div>
        </div>

        <?php // ── Info grid ─────────────────────────────────────── ?>
        <div class="ohscoop-info-grid">
            <div class="ohscoop-info-card"><div class="ohscoop-info-icon">⏱️</div><div class="ohscoop-info-val"><?php echo esc_html($a['activePrep']??'—'); ?></div><div class="ohscoop-info-label">Active prep</div></div>
            <div class="ohscoop-info-card"><div class="ohscoop-info-icon">❄️</div><div class="ohscoop-info-val"><?php echo esc_html($a['freezeTime']??'—'); ?></div><div class="ohscoop-info-label">Freeze / Cook</div></div>
            <div class="ohscoop-info-card"><div class="ohscoop-info-icon">🕐</div><div class="ohscoop-info-val"><?php echo esc_html($a['totalTime']??'—'); ?></div><div class="ohscoop-info-label">Total time</div></div>
            <div class="ohscoop-info-card"><div class="ohscoop-info-icon">📊</div><div class="ohscoop-info-val"><?php echo esc_html($a['difficulty']??'—'); ?></div><div class="ohscoop-info-label">Difficulty</div></div>
            <div class="ohscoop-info-card ohscoop-servings-card">
                <div class="ohscoop-info-icon">🍽️</div>
                <div class="ohscoop-info-val">
                    <button class="ohscoop-serve-btn" onclick="ohscoopAdjustServings(<?php echo $post_id; ?>,-1)">−</button>
                    <span class="ohscoop-serving-num" data-base="<?php echo $servings; ?>"><?php echo $servings; ?></span>
                    <button class="ohscoop-serve-btn" onclick="ohscoopAdjustServings(<?php echo $post_id; ?>,1)">+</button>
                </div>
                <div class="ohscoop-info-label"><?php echo esc_html($unit); ?></div>
            </div>
            <div class="ohscoop-info-card"><div class="ohscoop-info-icon">📅</div><div class="ohscoop-info-val"><?php echo esc_html($a['storage']??'—'); ?></div><div class="ohscoop-info-label">Storage</div></div>
            <div class="ohscoop-info-card"><div class="ohscoop-info-icon">🌸</div><div class="ohscoop-info-val"><?php echo esc_html($a['season']??'—'); ?></div><div class="ohscoop-info-label">Best season</div></div>
        </div>

        <?php // ── Video ─────────────────────────────────────────── ?>
        <?php if ( $video ) :
            // Convert YouTube watch URLs to embed
            $embed = preg_replace( '/watch\?v=/', 'embed/', $video );
            $embed = preg_replace( '/youtu\.be\//', 'youtube.com/embed/', $embed );
        ?>
        <div class="ohscoop-section-title">📹 Video Tutorial</div>
        <div class="ohscoop-video-wrap">
            <iframe src="<?php echo esc_url($embed); ?>" frameborder="0" allowfullscreen loading="lazy" title="Recipe video"></iframe>
        </div>
        <?php endif; ?>

        <?php // ── Equipment ─────────────────────────────────────── ?>
        <?php if ( !empty($equipment) ) : ?>
        <div class="ohscoop-section-title">🍴 Equipment</div>
        <div class="ohscoop-equipment-list">
            <?php foreach ( $equipment as $eq ) :
                $eqUrl = esc_url( $eq['affiliateUrl'] ?? '' );
            ?>
            <div class="ohscoop-equipment-item">
                <?php if ( $eqUrl ) : ?>
                <a href="<?php echo $eqUrl; ?>" target="_blank" rel="nofollow sponsored noopener" class="ohscoop-affiliate-link">
                    <?php echo esc_html($eq['name']??''); ?> <span class="ohscoop-ext">↗</span>
                </a>
                <?php else : ?>
                <span><?php echo esc_html($eq['name']??''); ?></span>
                <?php endif; ?>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>

        <?php // ── Ingredients ───────────────────────────────────── ?>
        <div class="ohscoop-section-title">Ingredients
            <span class="ohscoop-serving-note">for <span class="ohscoop-serving-inline"><?php echo $servings; ?></span> <?php echo esc_html($unit); ?></span>
        </div>
        <ul class="ohscoop-ing-list">
            <?php foreach ( $ingredients as $ing ) :
                $affUrl = esc_url( $ing['affiliateUrl'] ?? '' );
                $sub    = esc_html( $ing['sub'] ?? '' );
                $amtUS  = esc_html( $ing['amountUS'] ?? '' );
                $amtMet = esc_html( $ing['amountMetric'] ?? '' );
            ?>
            <li class="ohscoop-ing-item">
                <span class="ohscoop-ing-emoji"><?php echo esc_html($ing['emoji']??'•'); ?></span>
                <div class="ohscoop-ing-name">
                    <?php if ( $affUrl ) : ?>
                    <a href="<?php echo $affUrl; ?>" target="_blank" rel="nofollow sponsored noopener" class="ohscoop-affiliate-link">
                        <?php echo esc_html($ing['name']??''); ?> <span class="ohscoop-ext">↗</span>
                    </a>
                    <?php else : ?>
                    <?php echo esc_html($ing['name']??''); ?>
                    <?php endif; ?>
                    <?php if ( $sub ) : ?><div class="ohscoop-ing-note"><?php echo $sub; ?></div><?php endif; ?>
                </div>
                <span class="ohscoop-ing-amount">
                    <span class="ohscoop-amt-us"><?php echo $amtUS; ?></span>
                    <span class="ohscoop-amt-metric" style="display:none"><?php echo $amtMet; ?></span>
                </span>
            </li>
            <?php endforeach; ?>
        </ul>

        <?php // ── Steps ─────────────────────────────────────────── ?>
        <div class="ohscoop-section-title">Method — <?php echo count($steps); ?> Steps</div>
        <ul class="ohscoop-steps">
            <?php $n=1; foreach ( $steps as $step ) :
                $isMachine = !empty($step['isMachine']);
                $tip = esc_html($step['tip']??'');
            ?>
            <li class="ohscoop-step">
                <div class="ohscoop-step-num <?php echo $isMachine?'ohscoop-step-machine':''; ?>"><?php echo $n; ?></div>
                <div class="ohscoop-step-body">
                    <div class="ohscoop-step-title">
                        <?php echo esc_html($step['title']??''); ?>
                        <?php if ( $isMachine && $showMachine ) : ?>
                        <span class="ohscoop-machine-badge"><?php echo $machine; ?></span>
                        <?php endif; ?>
                    </div>
                    <div class="ohscoop-step-desc"><?php echo esc_html($step['desc']??''); ?></div>
                    <?php if ( $tip ) : ?>
                    <div class="ohscoop-step-tip">💡 <?php echo $tip; ?></div>
                    <?php endif; ?>
                </div>
            </li>
            <?php $n++; endforeach; ?>
        </ul>

        <?php // ── Nutrition ─────────────────────────────────────── ?>
        <?php $hasNut = array_filter([$a['cal']??'',$a['fat']??'',$a['carbs']??'',$a['protein']??'']); ?>
        <?php if ( !empty($hasNut) ) : ?>
        <div class="ohscoop-section-title">Nutrition per serving</div>
        <div class="ohscoop-nutrition-grid">
            <?php $nuts = [['cal','Calories'],['fat','Fat'],['carbs','Carbs'],['protein','Protein'],['sugar','Sugars'],['fibre','Fibre'],['sodium','Sodium']];
            foreach($nuts as [$key,$label]) : if(!empty($a[$key])) : ?>
            <div class="ohscoop-nut-card">
                <div class="ohscoop-nut-val"><?php echo esc_html($a[$key]); ?></div>
                <div class="ohscoop-nut-label"><?php echo $label; ?></div>
            </div>
            <?php endif; endforeach; ?>
        </div>
        <?php endif; ?>

        <?php // ── Badges & Allergens ────────────────────────────── ?>
        <?php if ( !empty($a['badges']) ) : ?>
        <div class="ohscoop-badges">
            <?php foreach ( explode(',',$a['badges']) as $b ) :
                $b = trim($b); if(!$b) continue; ?>
            <span class="ohscoop-badge">✓ <?php echo esc_html($b); ?></span>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
        <?php if ( !empty($a['allergens']) ) : ?>
        <div class="ohscoop-allergens">⚠️ <?php echo esc_html($a['allergens']); ?></div>
        <?php endif; ?>

        <?php // ── Star rating widget ────────────────────────────── ?>
        <?php if ( !empty($a['ratingEnabled']) ) : ?>
        <div class="ohscoop-rating-widget">
            <div class="ohscoop-rating-label">Rate this recipe</div>
            <div class="ohscoop-stars-input" data-post="<?php echo $post_id; ?>">
                <?php for($i=1;$i<=5;$i++): ?>
                <button class="ohscoop-rate-star" data-value="<?php echo $i; ?>" onclick="ohscoopRate(<?php echo $post_id; ?>,<?php echo $i; ?>)" title="<?php echo $i; ?> star<?php echo $i>1?'s':''; ?>">★</button>
                <?php endfor; ?>
            </div>
            <div class="ohscoop-rating-thanks" id="ohscoop-thanks-<?php echo $post_id; ?>" style="display:none">
                Thanks for rating! ⭐
            </div>
        </div>
        <?php endif; ?>

        <?php // ── Footer ────────────────────────────────────────── ?>
        <div class="ohscoop-footer">
            <span>Made with <a href="https://cybertrickz.info/ohscoop" target="_blank" rel="noopener">OhScoop</a> by <a href="https://cybertrickz.info" target="_blank" rel="noopener">cybertrickz</a></span>
        </div>

    </div><!-- .ohscoop-wrap -->
    <?php
    return ob_get_clean();
}
