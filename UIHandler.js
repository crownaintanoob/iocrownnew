function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function containsNumbers(str) {
    return Boolean(str.match(/\d/));
}

document.addEventListener("DOMContentLoaded", async function () {
    $(".dropdown-menu button").click(function () {
        let optionSelectedText = $(this).text();
        $("[name='dropdownServerButton']").html(optionSelectedText);
    });
    const PlayButtons = document.getElementsByName("PlayB");
    const PlayFrame = document.getElementsByName("PlayFrame");
    const usernameTextArea = document.getElementsByName("UsernameTextArea");

    PlayButtons[0].addEventListener("click", async function () {
        if (containsNumbers($("[name='dropdownServerButton']").text()) == true) {
            $("#NotifNoServerSelected").toast("hide");
            PlayFrame[0].style.opacity = 1;
            for (let opacityReduce = 0; opacityReduce < 5; opacityReduce++) {
                await sleep(25);
                PlayFrame[0].style.opacity = PlayFrame[0].style.opacity - 0.2;
            }
            PlayFrame[0].style.visibility = "hidden";
            const playclickedEvent = new CustomEvent("playclicked", { detail: { "Username": usernameTextArea[0].value, "RoomName": $("[name='dropdownServerButton']").text() } });
            document.dispatchEvent(playclickedEvent);
        }
        else {
            document.getElementById('ErrorSound').play();
            $("#NotifNoServerSelected").toast("show", {
                delay: 8000
            });
        }
    });
});