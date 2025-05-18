<script>

    let count = $state(0)
</script>

<h1 class="text-3xl font-bold underline">
{count}
</h1>
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onclick={() => count++}>
    Increment
</button>



<style>
    h1 {
        color: #4A5568;
    }
    button {
        margin-top: 20px;
        padding: 10px 20px;
        background-color: #3182CE;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: background-color 0.3s ease;
    }
    button:hover {
        background-color: #2B6CB0;
    }
    button:active {
        background-color: #2C5282;
    }
    </style>