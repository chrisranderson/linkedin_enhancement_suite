function start () {
    const DEBUGGING = true
        
    const INFINITE_SCROLL_CONTAINER_SELECTOR = ".scaffold-finite-scroll__content"
    const PATTERNS = [
        // permanent
        /Celebrating a Work Anniversary/i,
        /on their work anniversary/i,
        /started a new position/i,
        /starting a new position/i,
        /I just earned a skill badge/i,
        /(^[^\n]{1,120}\n\n){4}/im,  // lots of short paragraphs
        /network.*linkedin/i,
        /exciting new opportunity/i,
        /looking to hire/i,
        /Jobs recommended for you/i,
        /#excel/i,
        /[0-9] followers/,  // businesses
        // for now
        /s'? job update/i,  // title changes
        /obtained a new certification/i,
        /((layoff)|(laid off))/i,
        /Musk/g,
        /Elon/g,
        /Trump/g,
        /looking for a new role/i,
        /linkedin premium/i,
        /looking for new opportunit/i,
        /accepted an offer/i,
        /Promoted/,
    ]
    
    const SEARCH_SELECTORS = [
        ".feed-shared-update-v2__description-wrapper",
        ".update-components-header",
        ".feed-shared-celebration",
        ".update-components-actor"
    ]

    
    function main () {
        print("Running main.")
        let patterns = []
        
        get_muted_phrases_list(function (saved_patterns) {
            patterns = saved_patterns.map(function (pattern) {
                regex = new RegExp(pattern)
                return regex
            })
            print("Loaded patterns:", patterns)
        })
        
        let infinite_scroll_container = document.querySelector(INFINITE_SCROLL_CONTAINER_SELECTOR)
        let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        let feed_observer = new MutationObserver(function(mutations, observer) {
            print("triggered")
            // fired when a mutation occurs
            // let added_nodes = [].concat(mutations.map(function(mutation_record) {
            //     return Array.from(mutation_record.addedNodes)
            // })).flat(1)
            let all_cards = Array.from(document.querySelectorAll(`${INFINITE_SCROLL_CONTAINER_SELECTOR} > div`))
            delete_bad_cards(all_cards, patterns)
        });
        
        feed_observer.observe(infinite_scroll_container, {
            childList: true,
            subtree: true,
        });
        let all_cards = Array.from(document.querySelectorAll(`${INFINITE_SCROLL_CONTAINER_SELECTOR} > div`))

        delete_bad_cards(all_cards, patterns)
    }
    
    function delete_bad_cards (new_cards, patterns) {
        
        new_cards.forEach(function (feed_card, index) {
            let post_text = ""

            for (let selector of SEARCH_SELECTORS) {
                post_text += feed_card?.querySelector(selector)?.innerText
            }
                
            let hide_post = false
            let matching_pattern = ""
            
            for (const pattern of patterns) {
                if (post_text?.match(pattern)) {
                    hide_post = true
                    matching_pattern = pattern
                    break
                }
            }
            
            if (hide_post) {
                if (DEBUGGING) {
                    feed_card.style.outline = "solid 1px red"
                    feed_card.style.border = "solid 1px red"

                    if (!feed_card.classList.contains("debugging")) {
                        let debug_div = document.createElement("div")
                        debug_div.innerHTML = `Matched: ${matching_pattern}`
                        feed_card.appendChild(debug_div)
                        feed_card.classList.add("debugging")
                    }
                } else {
                    feed_card.remove()
                }
            }
        })
    }
    
    main()
}

start()
