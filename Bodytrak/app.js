document.getElementById("search").addEventListener('click', function() {
    addLoader()
    bodytrak.connect()
});

function addLoader()
{
    document.getElementById("search").style.display = "none";
    document.getElementById("loader").className += ' loading';
}

function onDisconnected()
{
    console.log('Device disconnected!');
    // TODO: reconnect or search for devices screen
}

