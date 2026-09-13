---
title: In an Era When Hair Salons Build Websites with ChatGPT, Where Does the Value of Web Development Lie?
description: A salon conversation about editing a website with ChatGPT leads to external booking systems, free static hosting,
  maintenance debt, and the changing value of web developers.
pubDate: '2026-09-13'
heroImage: ../../../assets/blog/salon-chatgpt-static-hosting-web-development/hero.png
heroImageAlt: Editorial illustration of a salon mirror, chair and scissors beside a laptop displaying a salon website
tags:
- ai
- chatgpt
- cloudflare
- web-development
- seo
- accessibility
- ux
---

Today, I went to a hair salon for a trim. While getting my hair cut, I was chatting with the hairstylist and learned that they were editing the salon’s website themselves. The fact that they were using ChatGPT to update the site came up naturally in an everyday conversation.

Hearing that made me realize how much AI is becoming part of daily life. The hairstylist was doing their regular work while also taking care of the website their business needed. A shift that had felt familiar to me as someone who regularly uses development tools was now part of the actual work of someone I met at a hair salon.

Our conversation turned to where to deploy the website and how to run it. Even when someone can edit what appears on a page, publishing it online and keeping it running still involves many unfamiliar challenges. This conversation prompted me to think about how AI is changing not only website creation but also the process of choosing and adopting infrastructure—and what that change demands of web agencies and developers.

## When Bookings Use a Separate System, the Website’s Role Changes Too

In the examples I had encountered involving hair salons in Japan, many used a booking system under a separate contract. When I asked how bookings were handled this time, the salon was also using a system separate from its website. This was not the result of an industry-wide survey, but it was important enough to inform how this particular site should be structured.

If there is no need to build booking functionality, the website’s job becomes much simpler. It needs to introduce the salon’s atmosphere and services, provide the service menu, prices, opening hours, and location, and then direct visitors to the existing booking system. There is less reason to create customer accounts within the website or set up a new database to store booking information.

Given those conditions, I recommended Cloudflare’s free plan. Static hosting, which serves prebuilt HTML, CSS, images, and other files, can be enough for an informational site. A static site can still display photos, expand menus, and provide links to a booking system. In other words, it does not need an architecture in which a server looks up booking or customer information and generates a page on every visit.

Cloudflare Workers Static Assets is a feature for deploying these static files. According to the official documentation, static asset requests are free and unlimited, and asset storage carries no additional charge. There are platform limits on file counts, sizes, and other factors, but an informational website can get started without hosting costs. Dynamic features that execute server-side code are subject to separate limits and pricing conditions.

Of course, this does not make the existing booking system contract, domain renewals, or subscriptions to the chosen AI service free. My suggestion was a setup that retained the booking system already in use while reducing the additional hosting costs and maintenance responsibilities for the informational site.

## The Convenience of Web Hosting Still Leaves Work to Be Done

There are reasons people choose a conventional web hosting service when first publishing a website. Infrastructure is particularly difficult for non-developers, and hosting services address that problem through control panels and installation tools. Connecting a domain and installing a CMS can get a site online relatively quickly. That initial convenience is a clear advantage.

Ongoing operation is a different matter. The specifics depend on how much the hosting provider manages, but there may still be work to do: updating the installed CMS and plugins, protecting administrator accounts, and maintaining backup and recovery procedures. If deferred updates pile up because everything is working for now, they can later return as the cost of resolving compatibility problems or responding to a security breach. Technical debt arises when an initially convenient choice continues without a maintenance plan.

A server breach also came up in this conversation. I did not examine the environment or logs from the incident, so I cannot identify its cause. Nor can I generalize from it to conclude that conventional web hosting is inherently dangerous. It does, however, provide a reason to consider whether more components are being maintained than are actually necessary to run an informational site.

Deploying static files to a managed serverless environment makes it possible to avoid having a server operating system, CMS, or database that the site operator must manage directly. Serverless does not mean there are no servers; it means the platform takes on server-related management tasks. By reducing components the website does not need, this approach can lower the security burden compared with continuing to run a CMS with missed updates and multiple plugins.

Cloudflare provides basic DDoS protection even on its free plan. The platform’s defenses can help counter attacks that attempt to disrupt a service with large volumes of traffic. However, they do not automatically address account takeovers, accidentally exposed secret keys, or vulnerabilities in added features. Protecting accounts and keeping copies of source files remain the operator’s responsibility. Describing an environment as relatively safe is meaningful only when both these responsibilities and the actual configuration are considered.

## AI Broadens Who Can Choose Infrastructure

An environment such as Cloudflare Workers can feel unfamiliar from its name to the way it is configured. Users need to prepare files for deployment, connect a domain, and interpret error messages. Tasks handled through familiar buttons in a hosting control panel may appear to be split into several steps. For non-developers, this initial learning process has been a substantial burden.

ChatGPT can help by explaining unfamiliar concepts and organizing the next steps for the current situation. The conversation used to create the website’s structure and wording can continue into deployment preparation. Users can ask what to check in the official documentation and, when an error occurs, narrow down possible causes using the message and current settings, with sensitive information excluded.

This does not mean everyone can complete a deployment on the first attempt. It is still necessary to check whether the AI’s explanation matches the service as it currently exists and to test the pages and links at the actual URL. Still, it is a significant change when someone who previously could not get started because of unfamiliar terminology and settings can now make an attempt while asking questions.

As a result, non-developers are more likely to be able to choose a serverless environment with a low operational burden and use it at very little cost within the scope they need. If, as with this salon, there is a separate booking system and the site is primarily informational, static hosting can be set up for free. The costs AI reduces include not only the time spent writing code but also the effort required to understand and adopt these options.

The hairstylist was already editing their own website. During our conversation, I recommended Cloudflare as a deployment approach suited to that work; I did not verify an actual migration or deployment outcome. What struck me was how their efforts with AI were extending from editing the website to choosing how to run it.

## What Do Agencies and Developers Need to Do Better?

This change also raises questions for web agencies, IT companies, and web developers. If clients can increasingly create pages themselves and publish them on managed platforms, I think it will become harder to maintain existing prices and differentiation simply by saying, “We build your website and deploy it securely.”

That does not mean secure implementation and deployment lose their value. Complex business systems and services that handle personal information still require deep expertise. But for small, primarily informational sites, as the barriers to basic creation and deployment fall, professionals need to show more concretely what value they provide beyond those tasks.

For a salon website, what matters is whether customers can discover the salon, decide whether its services suit them, and proceed to make a booking. Search, content, accessibility, user experience, and design all play a part in that journey.

SEO is the work of helping search systems discover a site and understand its content. The starting point should be whether the salon’s name, location, and service descriptions answer real customers’ questions. AIO, which aims to make information discoverable and accurately used in AI search, and GEO, or generative engine optimization, are connected to this same foundation. Google states that existing SEO fundamentals apply to its AI search features and that no special optimization is required. Rather than attaching a new acronym, professionals need to be able to explain what they check and improve.

For example, even if a price appears in search results, customers may misunderstand it if the applicable conditions are missing. It is necessary to check whether the services, prices, intended customers, and conditions are clearly stated in the page content, and how they are conveyed in actual search results and answers. I covered this relationship and the methods for checking it in more detail in [SEO and Accessibility Checks and Answer Verification for AI Search Optimization](https://jangwook.net/en/blog/en/ai-search-seo-accessibility-checklist/). What is needed is the ability to present identified problems and the reasoning behind improvements, rather than promises of visibility or sales.

Web accessibility, or a11y, also matters. This means checking whether people can enlarge prices to read them on a phone, or find and use a booking link with a keyboard and assistive technology. If the name shown on screen differs from the name conveyed to assistive technology, interaction can become difficult. Specific examples are available in [the article on accessible names and voice control](https://jangwook.net/en/blog/en/accessible-name-agents-2026/). Accessibility is not decoration for a search score; it is a quality concern about whether real customers can use the site.

UX and design can provide a competitive advantage by shaping the sequence in which visitors make decisions. Professionals need to consider what first-time customers want to know, the order in which to present examples of services and prices, and whether moving to an external booking system causes confusion. The ability to create attractive pages needs to be combined with an understanding of the salon’s characteristics and customers’ concerns. [A Practical Case Study of Frontend Improvements Based on UX Psychology](https://jangwook.net/en/blog/en/ux-psychology-implementation-case-study/) is another reference for applying this kind of judgment to an actual interface. The effects of individual improvements must be verified within the user journey of the site in question.

These fields are not completely separate from code. They are also connected to HTML structure, performance, and measurement methods. The point is that implementation skills need to expand to include understanding the client’s business, organizing content, and observing user behavior. Rather than handling every field alone, professionals can also deepen their own strengths and collaborate with other specialists.

Hearing about website editing at a salon I had visited for a haircut made me think about the future of web development. As creation and deployment become easier, professionals will increasingly be expected to help businesses become easier to discover, more accurately understood, and more convenient to use. I believe the competitive strength agencies and developers need to build lies in proposing improvements suited to each client’s situation and verifying them in practice.

## References

The technical conditions were checked against the official documentation on September 13, 2026.

- [Cloudflare Workers Static Assets Pricing and Limits](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/): Differences in billing between static file requests and server-side code execution.
- [Cloudflare DDoS Protection Coverage](https://developers.cloudflare.com/ddos-protection/): The scope of basic protection, including on the free plan.
- [Google’s AI Search Features and Guidance for Websites](https://developers.google.com/search/docs/appearance/ai-features): SEO fundamentals that apply to AI search.
- [W3C’s Guide to Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html): Why visible labels and accessible names should match.

If you need advice on building and running a website, using AI, or improving search, accessibility, or UX, please feel free to contact me at [me@jangwook.net](mailto:me@jangwook.net).
