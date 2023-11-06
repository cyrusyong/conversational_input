const textContainer = document.getElementById('text-container');
let reactionButtons = null;

// textContainer.addEventListener('mouseup', handleSelection);

const likeButton = document.getElementById('like-button');
const dislikeButton = document.getElementById('dislike-button');

likeButton.addEventListener('click', showLikedText);
dislikeButton.addEventListener('click', showDislikedText);



const m = {0:0, 1:10, 2:100, 3:50, 4:75, 5:150, 6:100};
const n = {0:0, 1:200, 2:50, 3:50, 4:100, 5:200, 6:100};

const total = 10+100+50+75+150+100;
const total2 = 200+50+50+100+200+100;
// const t3 = document.getElementById('t3');
// const arr = t3.firstChild.data.split(". ")
// console.log(t3.firstChild.data.split(". "))
// for (let i = 0; i < arr.length; i++) {
//     m[i] = 1
// }
// console.log(m);

function showLikedText() {
    // const likedText = document.querySelector(`#like-${i}`);
    
    for (let i = 0; i < 7; i++) {
        const idd = `like-${i+1}`;
        const likedText = document.getElementById(idd);
        likedText.style.background = `rgba(255,255,0,${m[i]/total})`
        
    }

}

function showDislikedText() {
    // const likedText = document.querySelector(`#like-${i}`);
    
    for (let i = 0; i < 7; i++) {
        const idd = `like-${i+1}`;
        const likedText = document.getElementById(idd);
        likedText.style.background = `rgba(255,0,0,${n[i]/total2})`
        
    }

}


function handleSelection() {
    const selection = window.getSelection();
    const selectedText = selection.toString().split("\n")[0];
    
    if (selectedText.length > 0) {
        const span = document.createElement('span');
        span.className = 'highlighted';
        span.textContent = selectedText;
        
        // Create and append reaction buttons
        reactionButtons = document.createElement('div');
        reactionButtons.className = 'reactions';
        reactionButtons.innerHTML = `
            <button class="reaction-button" onclick="addReaction('like')">Like</button>
            <button class="reaction-button" onclick="addReaction('dislike')">Dislike</button>
            <button class="reaction-button" onclick="addReaction('comment')">Comment</button>
        `;
        
        span.appendChild(reactionButtons);
        
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(span);
    } else {
        // Clear previously selected text and hide reaction buttons
        if (reactionButtons) {
            reactionButtons.parentNode.removeChild(reactionButtons);
            reactionButtons = null;
        }
    }
}

function addReaction(reactionType) {
    // Here you can implement logic to add a reaction to the selected text
    const selection = window.getSelection();
    const selectedText = selection.toString().split("\n")[0];
    
    if (selectedText.length > 0) {
        const span = document.createElement('span');
        span.className = 'highlighted-like';
        if (reactionType === "dislike") {
            span.className = 'highlighted-dislike'
        }
        span.textContent = selectedText;
        
        // Create and append reaction buttons
        // reactionButtons = document.createElement('div');
        // reactionButtons.className = 'reactions';
        // reactionButtons.innerHTML = `
        //     <button class="reaction-button" onclick="addReaction('like')">Like</button>
        //     <button class="reaction-button" onclick="addReaction('dislike')">Dislike</button>
        //     <button class="reaction-button" onclick="addReaction('comment')">Comment</button>
        // `;
        
        // span.appendChild(reactionButtons);
        
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(span);
    } else {
        // Clear previously selected text and hide reaction buttons
        if (reactionButtons) {
            reactionButtons.parentNode.removeChild(reactionButtons);
            reactionButtons = null;
        }
    }
    window.getSelection().removeAllRanges()

    // alert(`Added ${reactionType} reaction.`);
}
