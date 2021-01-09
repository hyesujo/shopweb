
const slide = () => {
    const wrap = document.querySelector('.slideNav');
    const target = wrap.children[0];
    const len = target.children.length;

    target.style.cssText = `width:calc(100% * ${len});display:flex;transition:1s;`;

    Array.from(target.children)
    .forEach(ele => ele.style.cssText = `width:calc(100% / ${len});`);
    let pos = 0;
    setInterval(() => {
        pos = (pos + 1) % len;
        target.style.marginLeft = `${-pos * 100}%`;
    }, 2500);
}

window.onload = function() {
    slide();
}

const openMenu = (x) => {
   let windowWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
   x.classList.toggle('change');
   if(x.className === 'container') {
    document.getElementById("mySidenav").style.width = "0%";
    document.getElementById("main").style.marginLeft = "0%";
   } else if(x.className = 'container change') {
    document.getElementById("mySidenav").style.width = "20%";
    document.getElementById("main").style.marginLeft = "20%";
    if(windowWidth < 767) {
        document.getElementById("mySidenav").style.width = "32%";
    document.getElementById("main").style.marginLeft = "32%";
    }
   } 
}

const closeNav = () => {
    document.getElementById('mySidenav').style.width = "0%";
    document.getElementById('main').style.marginLeft = "0%";
    let con = document.getElementsByClassName('container');
    con[0].className = "container";
}


