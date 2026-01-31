document.addEventListener('DOMContentLoaded',()=>{
    const searchInput=document.querySelector('input[name="search"]');
    if(searchInput){
        searchInput.addEventListener('focus',()=>{searchInput.style.boxShadow='0 0 10px #ff6b81';});
        searchInput.addEventListener('blur',()=>{searchInput.style.boxShadow='none';});
    }
});
