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

        if (comperDiv > 850) {
            mainNav.classList.add("active"); // Add active class when condition is met
            x='100vw'

        } else {
            mainNav.classList.remove("active");
        }
    });
});

</script>
<div class="nav">
    <nav>
        {#if comperDiv < 15}
        <ul out:fly={{ y: -50, duration: 350, delay: 50 }}>
            <li in:fly={{ y: -50, duration: 500, delay: 150, easing:cubicOut}}><a href="/">בית</a></li>
            <li in:fly={{ y: -50, duration: 500, delay: 200, easing:cubicOut}}><a href="/Neworder">פתיחת הזמנות</a></li>
            <li in:fly={{ y: -50, duration: 500, delay: 250, easing:cubicOut}}><a href="/contact">הזמנות שנקלטו</a></li>
            <li in:fly={{ y: -50, duration: 500, delay: 300, easing:cubicOut}}><a href="/customersIndex">אינדקס לקוחות</a></li>
            <li in:fly={{ y: -50, duration: 500, delay: 350, easing:cubicOut}}><a href="/portfolio">לקוחות קיימים</a></li>
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


<style>
    .nav{
        margin-bottom: 6rem;
    }
li {
    list-style: none;
    display: inline-block;
    margin-right: clamp(1rem, 2vw, 2rem);
    isolation: isolate;
}
li a {
    font-size: clamp(1rem, 1.5vw, 1.5rem);
    text-decoration: none;
    font-weight: 500;
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



@keyframes underLine {
    to{
        width: 100%;
    }
}
</style>
