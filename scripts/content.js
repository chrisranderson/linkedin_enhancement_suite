function start () {
    const DEBUGGING = true
        
    const INFINITE_SCROLL_CONTAINER_SELECTOR = ".scaffold-finite-scroll__content"
    const PATTERNS = [
        // permanent
        /Celebrating a Work Anniversary/ig,
        /on their work anniversary/ig,
        /started a new position/ig,
        /starting a new position/ig,
        /I just earned a skill badge/ig,
        /(^[^\n]{1,120}\n\n){4}/igm,
        /network.*linkedin/ig,
        /exciting new opportunity/ig,
        /looking to hire/ig,
        /Jobs recommended for you/ig,
        
        // for now
        /'s job update/ig,
        /obtained a new certification/ig,
        /((layoff)|(laid off))/ig,
        /Musk/g,
        /Elon/g,
        /Trump/g,
        /looking for a new role/ig,
        /linkedin premium/ig,
        /looking for new opportunit/ig,
        /accepted an offer/ig,
    ]
    
    const SEARCH_SELECTORS = [
        ".feed-shared-update-v2__description-wrapper",
        ".update-components-header",
        ".feed-shared-celebration",
    ]
    
    function print(...message) {
        console.error("extension debug:", ...message)
    }
    
    function main () {
        print("Running main.")
        let infinite_scroll_container = document.querySelector(INFINITE_SCROLL_CONTAINER_SELECTOR)
        let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        let feed_observer = new MutationObserver(function(mutations, observer) {
            print("triggered")
            // fired when a mutation occurs
            // let added_nodes = [].concat(mutations.map(function(mutation_record) {
            //     return Array.from(mutation_record.addedNodes)
            // })).flat(1)
            let all_cards = Array.from(document.querySelectorAll(`${INFINITE_SCROLL_CONTAINER_SELECTOR} > div`))
            delete_bad_cards(all_cards)
        });
        
        feed_observer.observe(infinite_scroll_container, {
            childList: true,
            subtree: true,
        });
        let all_cards = Array.from(document.querySelectorAll(`${INFINITE_SCROLL_CONTAINER_SELECTOR} > div`))
    
        delete_bad_cards(all_cards)
        print("Feed observer:", feed_observer)
        print("Observing:", infinite_scroll_container)
    }
    
    function delete_bad_cards (new_cards) {
        
        new_cards.forEach(function (feed_card, index) {
            let post_text = ""

            for (let selector of SEARCH_SELECTORS) {
                post_text += feed_card?.querySelector(selector)?.innerText
            }
                
            let hide_post = false
            let matching_pattern = ""
            
            for (const pattern of PATTERNS) {
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
