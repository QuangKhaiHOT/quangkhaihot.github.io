document.addEventListener('DOMContentLoaded', function(){
    var innerContent = document.querySelector('main');
    let currentTheme = localStorage.getItem('theme');

    // tocbot
    var headings = innerContent.querySelectorAll('h1, h2');
    var prevHead;

    const tocBorad = document.querySelector(".toc-board");
    
    Array.from(headings).forEach(function(heading){
        let tocItem = document.createElement("li");
        tocItem.classList.add("toc-list-item");

        let itemLink = document.createElement("a");
        itemLink.classList.add("toc-link");
        itemLink.id = "toc-id-" + heading.textContent;
        itemLink.textContent = heading.textContent;

        tocItem.append(itemLink);

        itemLink.addEventListener('click', function(){
            heading.scrollIntoView({
                behavior: 'smooth'
            });
        });

        if (heading.tagName == 'H1'){
            itemLink.classList.add("node-name--H1");
            prevHead = tocItem;
            tocBorad.append(tocItem);
        }
        else {
            itemLink.classList.add("node-name--H2");

            if (prevHead == undefined) {
                tocBorad.append(tocItem);
                return;
            }

            let subList = prevHead.querySelector('ol');

            if (!subList){
                subList = document.createElement("ol");
                subList.classList.add("toc-list");
                prevHead.append(subList);
            }

            subList.append(tocItem);
        }
    });

    setInterval(function(){
        var scrollPos = document.documentElement.scrollTop;

        Array.from(tocBorad.querySelectorAll('.toc-link')).forEach(function(link){
            link.classList.remove('is-active-link');
        });

        var currHead;

        Array.from(headings).forEach(function(heading){
            let headPos = heading.getBoundingClientRect().top + window.scrollY - 512;

            if (scrollPos > headPos) currHead = heading;
        });

        if (currHead != undefined){
            let tocLink = document.getElementById("toc-id-" + currHead.textContent);
            tocLink.classList.add('is-active-link');
        }
    }, 200);

    // link (for hover effect)
    var links = innerContent.querySelectorAll('a:not(.related-item a)');

    links.forEach((link) => {
        link.setAttribute('data-content', link.innerText);
    });

    // Tag EventListener
    const searchPage = document.querySelector("#search");

    document.querySelectorAll('.tag-box .tag').forEach(function(tagButton){
        tagButton.addEventListener('click', function() {
            const contentID = tagButton.getAttribute('contentID');
            const inpuxBox = document.getElementById('search-input');
            searchPage.classList.add('active');

            inpuxBox.value = contentID;
            inpuxBox.dispatchEvent(new KeyboardEvent('keyup'));
        });
    });

    // Move to Top
    if (document.querySelector('.thumbnail')){
        const arrowButton = document.querySelector('.top-arrow');

        setInterval(function(){
            var scrollPos = document.documentElement.scrollTop;
    
            if (scrollPos < 512){
                arrowButton.classList.remove('arrow-open');
            }
            else {
                arrowButton.classList.add('arrow-open');
            }
        }, 1000);

        arrowButton.addEventListener('click', function(){
            window.scroll({top:0, behavior:'smooth'});
        });
    }

    // Code highlighter
    if (currentTheme === 'dark'){
        // Disable highlighter default color theme
        Array.from(innerContent.querySelectorAll('pre')).forEach(function (codeblock){
            codeblock.classList.add('pre-dark');
        });
    }
});

window.addEventListener('load', function(){
    // Page Hits
    const pageHits = document.getElementById('page-hits');

    if (pageHits) {
        const goatcounterCode = pageHits.getAttribute('usercode');
        const requestURL = 'https://' 
            + goatcounterCode 
            + '.goatcounter.com/counter/' 
            + encodeURIComponent(location.pathname) 
            + '.json';

        var resp = new XMLHttpRequest();
        resp.open('GET', requestURL);
        resp.onerror = function() { pageHits.innerText = "0"; };
        resp.onload = function() { pageHits.innerText = JSON.parse(this.responseText).count; };
        resp.send();
    }

    // Highlighter
    hljs.highlightAll();

    // Disable code highlights to the plaintext codeblocks
    document.querySelectorAll('.language-text, .language-plaintext').forEach(function(codeblock){
        codeblock.querySelectorAll('.hljs-keyword, .hljs-meta, .hljs-selector-tag').forEach(function($){
            $.outerHTML = $.innerHTML;
        });
    });

    // code clipboard copy button
    async function copyCode(block) {
        let code = block.querySelector("code");
        let text = code.innerText;
      
        await navigator.clipboard.writeText(text);
    }

    let blocks = document.querySelectorAll("pre");

    blocks.forEach((block) => {
        // only add button if browser supports Clipboard API
        if (navigator.clipboard) {
            let clip_btn = document.createElement("button");
            let clip_img = document.createElement("svg");

            clip_btn.setAttribute('title', "Copy Code");
            clip_img.ariaHidden = true;

            block.appendChild(clip_btn);
            clip_btn.appendChild(clip_img);

            clip_btn.addEventListener("click", async () => {
                await copyCode(block, clip_btn);
            });
        }
    });        
    window.addEventListener('message', handleMessage);
});