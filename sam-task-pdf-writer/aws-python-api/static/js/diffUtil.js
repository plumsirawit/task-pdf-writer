
function DiffUtil(){

    DiffUtil.getDiffFragment = function(original, changed) {
        // Highlight added part by green and removed part by red 

        var diff = JsDiff.diffWords(original, changed, {
            newlineIsToken: true
        }),

        fragment = document.createDocumentFragment();

        diff.forEach(function(part) {
            var color = part.added || part.removed ? '#24292e' : '#555';
            var bgcolor = part.added ? '#a6f3a6' :
                part.removed ? '#f8cbcb' : 'transparent';
            var span = document.createElement('span');
            span.style.color = color;
            span.style.backgroundColor = bgcolor;
            span.appendChild(document.createTextNode(part.value));
            fragment.appendChild(span);
        });

        return fragment;
    }

    DiffUtil.clearElement = function(element){
        while (element.firstChild) {
           element.removeChild(element.firstChild);
        }
    }

    DiffUtil.appendDiffFragmentToElement = function(original, changed, element){
        var fragment = DiffUtil.getDiffFragment(original, changed);
        DiffUtil.clearElement(element);
        element.appendChild(fragment);
    }

}

DiffUtil();
