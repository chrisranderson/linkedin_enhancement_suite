const MUTED_PHRASES_KEY = "muted_phrases"

function get_muted_phrases_list (result_callback) {
    print("Getting phrases from storage.")
    chrome.storage.sync.get([MUTED_PHRASES_KEY], function(result) {
        let raw_phrases = result[MUTED_PHRASES_KEY]
        let newline_temporary_replacement = "`-_"
        let with_replaced_newlines = raw_phrases.replaceAll("\\n", newline_temporary_replacement)
        let muted_phrases = with_replaced_newlines.split("\n").map(function (phrase) {
            return phrase.replaceAll(newline_temporary_replacement, "\\n")
        })
        result_callback(muted_phrases)
    })
}

function print(...message) {
    console.log("extension debug:", ...message)
}

function wait_for_element_by_selector (selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(_mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
