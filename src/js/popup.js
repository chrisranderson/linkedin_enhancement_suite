const MUTED_PHRASES_KEY = "muted_phrases"

let muted_phrases_textarea = document.querySelector("#muted_phrases")

chrome.storage.sync.get([MUTED_PHRASES_KEY], function(result) {
    muted_phrases_textarea.value = result[MUTED_PHRASES_KEY]
    print(`Set textarea to '${result[MUTED_PHRASES_KEY]}'`)
})

muted_phrases_textarea.addEventListener("change", function (event) {
    let textarea = event.target;
    let raw_phrases = textarea.value
    chrome.storage.sync.set({[MUTED_PHRASES_KEY]: raw_phrases})
    debugger;
})

    /**
Celebrating a Work Anniversary
on their work anniversary
(^[^\n]{1,120}\n\n){4}
network.*linkedin
#excel
[0-9] followers
s'? job update 
((layoff)|(laid off))
Promoted
     */
