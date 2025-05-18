<script>
import { onMount } from "svelte";
import { fly, slide} from "svelte/transition";
import { cubicOut } from 'svelte/easing';
let homeNav = ['Home', 'About', 'Contact', 'Services', 'Portfolio', 'Blog', 'Test'];

let leftDiv;
let comperDiv = $state(0);
let x = $state(0);

onMount(() => {
    let mainNav = document.querySelector("nav");
    document.addEventListener("scroll", (e) => {
    comperDiv = window.scrollY;
  
        // console.log(comperDiv);
        // console.log(xFromTopp);
        // console.log(x);
        // console.log(mainNav.classList);
        if (comperDiv > 850) {
            mainNav.classList.add("active"); // Add active class when condition is met
            x='100vw'
            leftDiv.style.display = 'none';

        } else {
            mainNav.classList.remove("active");
            x = Math.abs(comperDiv) + 'px';
            leftDiv.style.display = 'block';

        }
    });
});

</script>
<div class="nav">
    <nav>
        {#if comperDiv < 15}
        <ul out:fly={{ y: -50, duration: 350, delay: 50 }}>
            <li in:fly={{ y: -50, duration: 500, delay: 150, easing:cubicOut}}><a href="/">בית</a></li>
            <li in:fly={{ y: -50, duration: 500, delay: 200, easing:cubicOut}}><a href="/about">פתיחת הזמנות</a></li>
            <li in:fly={{ y: -50, duration: 500, delay: 250, easing:cubicOut}}><a href="/contact">הזמנות שנקלטו</a></li>
            <li in:fly={{ y: -50, duration: 500, delay: 300, easing:cubicOut}}><a href="/services">אינדקס לקוחות</a></li>
            <li in:fly={{ y: -50, duration: 500, delay: 350, easing:cubicOut}}><a href="/portfolio">Portfolio</a></li>
            <li in:fly={{ y: -50, duration: 500, delay: 400, easing:cubicOut}}><a href="/blog">Blog</a></li>
            <li in:fly={{ y: -50, duration: 500, delay: 450, easing:cubicOut}}><a href="/test">Test</a></li>
        </ul>
        {:else}
        <ul out:fly={{ y: 35, duration: 150,  }} in:fly={{ y: 35, duration: 300, delay: 400 }}>
            <li><a href="/">SECOND</a></li>
           
        </ul>
        {/if}
    </nav>
</div>
<section style="margin-top:300px; padding:50px 0 0 0" >
    <div bind:this={leftDiv} style="padding-left:50px">
    <h1>Scroll down to see the effect</h1>
    <p>When you scroll down, the navigation bar will change its style.</p>
    <p>Scroll back up to see the original style.</p>
</div>
<div style='width:{x}; height:{x}; background-color:blue; transition: all 1s forword'></div>
</section>
<div style="height: 200vh;"></div>

<style>
li {
    list-style: none;
    display: inline-block;
    margin-right: clamp(1rem, 2vw, 2rem);
    isolation: isolate;
}
li a {
    font-size: clamp(1rem, 2vw, 2rem);
    text-decoration: none;
    font-weight: bold;
    color: rgb(205, 205, 205);
    transition: color 0.3s ease, transform 0.3s ease;
}
li a:hover::after {
content: '';
    display: block;
    width: 0%;
    height: 2px;
    background: #707070;
    transform: scaleX(1);
    transition: transform 0.3s ease;
    animation: underLine 0.75s  ease forwards;
}   
li a:active {
    color: #00ff00;
}
nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 35px;
    height: 100px;
    max-height: 100px;
    mix-blend-mode: difference; /* 💥 this makes the whole nav blend */
    color: white;
    user-select: none;

}
ul{
    display: flex;
    justify-content: start;
    align-items: center;
    margin: 0;
    padding: 0; 
    flex-wrap: nowrap;
}
section{
    display: flex;
    justify-content: start;
    align-items: center;
    flex-direction: row;
    margin-top: 100px;
    gap: 100px;
}


@keyframes underLine {
    to{
        width: 100%;
    }
}
</style>
