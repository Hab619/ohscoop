<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function ohscoop_output_schema( $a, $post_id ) {
    static $done = [];
    if ( isset($done[$post_id]) ) return;
    $done[$post_id] = true;

    $schema = [
        '@context'    => 'https://schema.org',
        '@type'       => 'Recipe',
        'name'        => esc_html( $a['title'] ?? '' ),
        'description' => esc_html( $a['description'] ?? '' ),
        'author'      => [
            '@type' => 'Person',
            'name'  => get_the_author_meta( 'display_name', get_post_field('post_author', $post_id) ),
        ],
        'datePublished' => get_the_date( 'c', $post_id ),
        'dateModified'  => get_the_modified_date( 'c', $post_id ),
        'recipeCategory'  => esc_html( $a['category'] ?? '' ),
        'recipeCuisine'   => esc_html( $a['cuisine'] ?? '' ),
        'keywords'        => esc_html( $a['keywords'] ?? '' ),
        'prepTime'        => esc_html( $a['prepTimeISO'] ?? 'PT20M' ),
        'cookTime'        => esc_html( $a['cookTimeISO'] ?? 'PT0M' ),
        'totalTime'       => esc_html( $a['totalTimeISO'] ?? 'PT24H20M' ),
        'recipeYield'     => intval( $a['servings'] ?? 2 ) . ' ' . esc_html( $a['servingsUnit'] ?? 'servings' ),
    ];

    // Image
    if ( !empty($a['recipeImage']) ) {
        $schema['image'] = [ esc_url($a['recipeImage']) ];
    } elseif ( has_post_thumbnail($post_id) ) {
        $schema['image'] = [ get_the_post_thumbnail_url($post_id, 'full') ];
    }

    // Video
    if ( !empty($a['videoUrl']) ) {
        $schema['video'] = [
            '@type'       => 'VideoObject',
            'name'        => esc_html($a['title'] ?? ''),
            'description' => esc_html($a['description'] ?? ''),
            'contentUrl'  => esc_url($a['videoUrl']),
        ];
    }

    // Ingredients
    $ing_list = [];
    foreach ( $a['ingredients'] ?? [] as $ing ) {
        $amt = trim( ($ing['amountUS'] ?? '') . ' ' . ($ing['name'] ?? '') );
        if ( $amt ) $ing_list[] = esc_html($amt);
    }
    if ( $ing_list ) $schema['recipeIngredient'] = $ing_list;

    // Instructions
    $instructions = [];
    foreach ( $a['steps'] ?? [] as $step ) {
        $instructions[] = [
            '@type' => 'HowToStep',
            'name'  => esc_html( $step['title'] ?? '' ),
            'text'  => esc_html( $step['desc'] ?? '' ),
        ];
    }
    if ( $instructions ) $schema['recipeInstructions'] = $instructions;

    // Nutrition
    $nut = [];
    if ( !empty($a['cal']) )     $nut['calories']           = esc_html($a['cal']) . ' kcal';
    if ( !empty($a['fat']) )     $nut['fatContent']         = esc_html($a['fat']);
    if ( !empty($a['carbs']) )   $nut['carbohydrateContent']= esc_html($a['carbs']);
    if ( !empty($a['protein']) ) $nut['proteinContent']     = esc_html($a['protein']);
    if ( !empty($a['sugar']) )   $nut['sugarContent']       = esc_html($a['sugar']);
    if ( !empty($a['fibre']) )   $nut['fiberContent']       = esc_html($a['fibre']);
    if ( !empty($a['sodium']) )  $nut['sodiumContent']      = esc_html($a['sodium']);
    if ( $nut ) {
        $nut['@type'] = 'NutritionInformation';
        $schema['nutrition'] = $nut;
    }

    // Rating
    $rating = floatval( $a['ratingValue'] ?? 0 );
    $count  = intval( $a['ratingCount'] ?? 0 );
    if ( $rating > 0 && $count > 0 ) {
        $schema['aggregateRating'] = [
            '@type'       => 'AggregateRating',
            'ratingValue' => number_format( $rating, 1 ),
            'ratingCount' => $count,
            'bestRating'  => '5',
            'worstRating' => '1',
        ];
    }

    // Keywords from badges
    if ( !empty($a['badges']) ) {
        $existing = $schema['keywords'] ?? '';
        $schema['keywords'] = trim( $existing . ', ' . esc_html($a['badges']), ', ' );
    }

    echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
}
