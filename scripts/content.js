/*
Chris' list

Celebrating a Work Anniversary
on their work anniversary
started a new position
starting a new position
I just earned a skill badge
(^[^\n]{1,120}\n\n){4}
network.*linkedin
exciting new opportunity
looking to hire
Jobs recommended for you
#excel
[0-9] followers
s'? job update
obtained a new certification
((layoff)|(laid off))
Musk
Elon
Trump
looking for a new role
linkedin premium
looking for new opportunit
accepted an offer
Promoted
 */
const INFINITE_SCROLL_CONTAINER_SELECTOR = ".scaffold-finite-scroll__content"
const DEBUGGING = true
    

const SEARCH_SELECTORS = [
    ".feed-shared-update-v2__description-wrapper",
    ".update-components-header",
    ".feed-shared-celebration",
    ".update-components-actor",
    ".update-components-text"
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
    if (!infinite_scroll_container) {
        print("ERROR: could not find infinite_scroll_container.")
    }
    let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    
    let last_trigger_time = 0
    let feed_observer = new MutationObserver(function(mutations, observer) {
        let current_trigger_time = Date.now()
        if (current_trigger_time - last_trigger_time < 1000) {
            return
        }
        last_trigger_time = current_trigger_time
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
    print(`Checking ${new_cards.length} cards for deletion.`)
    
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

wait_for_element_by_selector(INFINITE_SCROLL_CONTAINER_SELECTOR).then(function () {
    main()
})
