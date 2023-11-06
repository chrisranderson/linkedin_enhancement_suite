/*
Chris' list

Celebrating a Work Anniversary|on their work anniversary
(^[^\n]{1,120}\n\n){4}
network.*linkedin
Jobs recommended for you
#excel
[0-9] followers
obtained a new certification|earned a skill badge
layoff|laid off
Musk|Elon|Trump
linkedin premium
Looking for new opportunit
Promoted|promoted
is seeking a
Just finished the course
s'? job update|a new role|start my new job
Exciting opportunity to join|I've recently joined
accepted an offer|a new position
We are hiring|#hiring|exciting new opportunity
looking to hire
FREE.*VIDEOS
FREE.*CLASSES
FREE.*TRAINING
*/
const APPLICATION_CONTAINER_SELECTOR = ".app-aware-link"
const INFINITE_SCROLL_CONTAINER_SELECTOR = ".scaffold-finite-scroll__content"
const CARD_HEADER_SELECTOR = ".update-components-actor"
const DEBUGGING = true

const PREFERENCE_NO_CLASS = "yeah-no"
const PREFERENCE_NO_SELECTOR = "." + PREFERENCE_NO_CLASS

const SEARCH_SELECTORS = [
    ".feed-shared-update-v2__description-wrapper",
    ".update-components-header",
    ".feed-shared-celebration",
    ".update-components-actor",
    ".update-components-text"
]

const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

wait_for_element_by_selector(INFINITE_SCROLL_CONTAINER_SELECTOR).then(function () {
    main()
})

wait_for_element_by_selector(APPLICATION_CONTAINER_SELECTOR).then(function () {
    let app_observer = new MutationObserver(function (mutations, observer) {
        print(`${APPLICATION_CONTAINER_SELECTOR} changed.`)
        main()
    })
    let app_container = document.querySelector(APPLICATION_CONTAINER_SELECTOR)
    app_observer.observe(app_container, {
        attributes: true
    })
})


/**
 *
 * @param {Element[]} cards_below_my_scroll_position
 */
function add_coworker_preference_links(cards_below_my_scroll_position) {
    let cards_without_links = cards_below_my_scroll_position.filter(function (card) {
        return card.querySelector(PREFERENCE_NO_SELECTOR) === null
    })
    cards_without_links.forEach(function(card) {
        let card_header = card.querySelector(CARD_HEADER_SELECTOR)
        // card_header.appendChild(create_yeah_no_image())
    })
}

let feed_observer = null

function main () {
    print("Running main.")
    let patterns = []
    let infinite_scroll_container = document.querySelector(INFINITE_SCROLL_CONTAINER_SELECTOR)
    if (!infinite_scroll_container) {
        print("ERROR: could not find infinite_scroll_container.")
    }
    
    let last_trigger_time = 0
    feed_observer = new MutationObserver(function(mutations, observer) {
        print("Feed observer triggered.")
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
        let cards_below_my_scroll_position = all_cards.filter(function (card) {
            return card.getBoundingClientRect().y >= -100;
        })
        delete_bad_cards(cards_below_my_scroll_position, patterns)
        add_coworker_preference_links(cards_below_my_scroll_position)
    });
    
    feed_observer.observe(infinite_scroll_container, {
        childList: true,
        subtree: true,
    });
    
    print(`Feed observer '${feed_observer}' is observing '${infinite_scroll_container}'`)
    
    get_muted_phrases_list(function (saved_patterns) {
        patterns = saved_patterns.map(function (pattern) {
            regex = new RegExp(pattern)
            return regex
        })
        print("Loaded patterns:", patterns)
        
        let all_cards = Array.from(document.querySelectorAll(`${INFINITE_SCROLL_CONTAINER_SELECTOR} > div`))
        delete_bad_cards(all_cards, patterns)
        add_coworker_preference_links(all_cards)
    })

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

function html_to_element(html) {
  let temp = document.createElement('template');
  html = html.trim();
  temp.innerHTML = html;
  return temp.content.firstChild;
}

function create_yeah_no_image() {
    return html_to_element(`<img class='${PREFERENCE_NO_CLASS}' alt='Logo: prefer not to work with this person' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACLCAYAAACp+ZEIAAAC9HpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHja7ZdbshsrDEX/GUWG0JIQEsPhWZUZZPjZdGPn2Mepur75NVQDBvVGaAFdDuPXzxl+IFFmDlHNU07pQIo5Zi5o+HGlcpZ0xLM8020Ivx/6g9c9wOgS1LJfSNv+1k93gasqaOlXobYH6uNAjlvfn4T4qmR5tNp9C+UtJHwN0BYo17KOlN2+LqGOq+63Jfr1hFVEf3T7229D9LpiHmEeQnKgFOHLAVkPBykYIJT4wVd3wWMoVfIWQ0BexemeYBfmcjW+NHqgMuprWrdWeKYVeZvIU5DTvX7ZH0ifBuQ+D3+dOfpu8WO/yCUVjqfor2fO7vNcM1ZRYkKo017UbSlnC3ZYcFxTe4BeOgyPQsLOnJEdu7phK/SjHRW5USYGrkmROhWaNM66UYOLkUdgQ4O5sZydLsaZG7iRxJVpskmWLg6i7cQehe++0DltPlo4Z3PM3AmmTBCjtRXezeHdF+ZcR4Ho2MHHtoBfOP2LA60wyiphBiI0d1D1DPAtP6fFVUBQV5TXEckIbL0kqtKfm0BO0AJDRX2dQbK+BRAiTK1wBicjEqiRKCU6jNmIEEgHoALXWSJXECBV7nCSo0gCG+c1NV4xOk1ZGd0B/bjMQEIl4YQ5CBXAilGxfyw69lBR0aiqSU1ds5YkKSZNKVlal2IxsRhMLZmZW7bi4tHVk5u7Zy+Zs+DS1JyyZc85l4I5C5QL3i4wKKVylRqrhpqqVa+5lobt02LTlpo1b7mVzl067o+eunXvuZdBA1tpxKEjDRs+8igTW21KmHHqTNOmzzzLnRrtY/uc36BGmxqfpJah3amh1+wmQes60cUMwPAVIRC3hQAbmhezwylGXuQWsyMzToUynNTFrNMiBoJxEOukG7vAF9FF7p+4BYsP3Pj/kgsL3ZvkvnN7Ra2vz1A7iV2ncAX1EJw+jA8v7GV97L7V4W8D79YfoY/QR+gj9BH6CH2E/rPQxKd7/Qf7DbCHiRU+yRqjAAABhGlDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TpaIVBwuKKGSoThZERTpqFYpQIdQKrTqYXPoFTRqSFhdHwbXg4Mdi1cHFWVcHV0EQ/ABxdHJSdJES/5cUWsR4cNyPd/ced+8AoV5imtUxAWh6xUzGY2I6syoGXtGDAQiIYkRmljEnSQl4jq97+Ph6F+FZ3uf+HL1q1mKATySeZYZZId4gntmsGJz3iUOsIKvE58TjJl2Q+JHristvnPMOCzwzZKaS88QhYjHfxkobs4KpEU8Th1VNp3wh7bLKeYuzVqqy5j35C4NZfWWZ6zSHEcciliBBhIIqiiihggitOikWkrQf8/APOX6JXAq5imDkWEAZGmTHD/4Hv7u1clOTblIwBnS+2PbHKBDYBRo12/4+tu3GCeB/Bq70lr9cB6KfpNdaWvgI6NsGLq5bmrIHXO4Ag0+GbMqO5Kcp5HLA+xl9UwbovwW619zemvs4fQBS1FXiBjg4BMbylL3u8e6u9t7+PdPs7wednHK41lqV8wAADXppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICB4bXBNTTpEb2N1bWVudElEPSJnaW1wOmRvY2lkOmdpbXA6NjE2YmFlODAtMTc1NS00ZDdmLTkyYWMtMjNjNzQ0Y2E4ZDQ2IgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjA4MjJiNmMyLWEzNTgtNDdjMi1hM2VmLTViNTRmOGM3M2QwMiIKICAgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmFmMDc3NGYzLTU1OTUtNGMyYi05OTBmLWJjZTNhNzViZTQ0NyIKICAgZGM6Rm9ybWF0PSJpbWFnZS9wbmciCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09Ik1hYyBPUyIKICAgR0lNUDpUaW1lU3RhbXA9IjE2NjkxNzI4ODIxMzc0MjciCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4zMiIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgeG1wOkNyZWF0b3JUb29sPSJHSU1QIDIuMTAiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjI6MTE6MjJUMjA6MDc6NTktMDc6MDAiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDIyOjExOjIyVDIwOjA3OjU5LTA3OjAwIj4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZGJlM2YxYmQtNzViOC00MWNlLWFmOTgtMjUyMTM0MGYzZGY0IgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKE1hYyBPUykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjItMTEtMjJUMjA6MDg6MDItMDc6MDAiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg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" />`)
}
