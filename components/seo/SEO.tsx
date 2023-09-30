// Copyright (c) 2021. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { isString } from "../../../../hg/core/types/String";

export interface SEOProps {
    readonly publicUrl         : string;
    readonly title             : string;
    readonly language          : string;
    readonly description       : string;
    readonly themeClassName   ?: string;
    readonly siteName         ?: string;
    readonly ogType           ?: string;
    readonly ogImage          ?: string;
    readonly twitterName      ?: string;
}

export function SEO (props: SEOProps) {

    const ogType = props?.ogType ?? 'article';
    const location = useLocation();
    const title       = props.title;
    const publicUrl       = props.publicUrl;
    const description = props.description;
    const language = props.language;
    const themeClassName = props.themeClassName;
    const twitterName = props?.twitterName;
    const siteName : string = props?.siteName ?? 'HyperApp';

    const queryString = location.search;
    const pageUrl : string = `${publicUrl}${location.pathname}${queryString ? `?${queryString}` : ''}`;

    let pageImageUrl : string | undefined = undefined;
    let ogImageWidth : string | undefined;
    let ogImageHeight : string | undefined;
    let ogImageType : string | undefined;

    if (isString(props?.ogImage)) {
        pageImageUrl = props?.ogImage;
    }

    // if (pageImageUrl === undefined) {
    //     ogImageType = 'image/png';
    //     ogImageWidth = '1200';
    //     ogImageHeight = '600';
    //     pageImageUrl = `${publicUrl}${getSeoOgImageUrl(createSendanorSeoImageData(
    //         title,
    //         description,
    //         price,
    //         buttonText,
    //         discountText,
    //         extraInfo,
    //         tagLine
    //     ), 'seo.png')}`;
    // }

    // og:ttl must be between 345600 and 2419200
    const ogTTL : number = 345600;

    return (
        <Helmet>
            <html className={themeClassName} lang={language} />
            <title>{title} - {siteName}</title>
            <meta name="description" content={description} />
            <base target="_blank" href={`${publicUrl}/`} />
            <link rel="canonical" href={pageUrl} />
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:updated_time" content={new Date().toISOString()} />
            <meta property="og:ttl" content={ogTTL.toFixed(0)} />
            <meta property="og:title" content={title} />
            <meta property="og:locale" content={language} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={pageImageUrl} />
            {ogImageWidth !== undefined ? <meta property="og:image:width" content={ogImageWidth} /> : null}
            {ogImageHeight !== undefined ? <meta property="og:image:height" content={ogImageHeight} /> : null}
            {ogImageType !== undefined ? <meta property="og:image:type" content={ogImageType} /> : null}
            <meta property="og:url" content={pageUrl} />

            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={pageImageUrl} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={`@${twitterName}`} />

            <meta name="robots" content="index, follow" />
        </Helmet>
    );

}
