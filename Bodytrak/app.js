document.getElementById("search").addEventListener('click', function()
{
    addLoader();
     
     bodytrak.connect().
     then(() => {
        document.getElementById("loader").style.display = "none";
        //document.getElementById("browse").style.display = "initial";
        document.getElementById("output_log").style.display = "initial";
     })
     .catch(error => {
         console.log("Connect error");
         document.getElementById("loader").style.display = "none";
         document.getElementById("search").style.display = "initial";
     });
});

document.getElementById('choose_file').addEventListener('change', function()
{
    document.getElementById("send_file").disabled = false;
});

document.getElementById("send_file").addEventListener('click', function()
{
    var files = document.getElementById('choose_file').files;
    if (!files.length)
    {
        alert('Please select a file!');
        return;
    }
    var file = files[0];
    document.getElementById("file_paragraph").style.display = "none";

    var progress = document.querySelector('.percent');

    // Reset progress indicator on new file selection.
    progress.style.width = '0%';
    progress.textContent = '0%';

    reader = new FileReader();
    reader.onerror = errorHandler;
    reader.onprogress = updateProgress;
    reader.onabort = function(e)
    {
        alert('File read cancelled');
    };
    reader.onloadstart = function(e)
    {
        document.getElementById('progress_bar').className = 'loading';
    };
    reader.onload = function(e)
    {
        var fw_array = new Uint8Array(e.target.result);
        bodytrak.sm_init();
        bodytrak.sm_ptek_update(fw_array);

        // Ensure that the progress bar displays 100% at the end.
        progress.style.width = '100%';
        progress.textContent = '100%';
        setTimeout("document.getElementById('progress_bar').className='';", 2000);
        console.log("End");
    };

    // Read in the image file as a binary string.
    reader.readAsArrayBuffer(file);
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
    bodytrak.sm_reset();
    location.reload(true);
}

function updateProgress(evt)
{
    // evt is an ProgressEvent.
    if (evt.lengthComputable)
    {
        var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
        // Increase the progress bar length.
        if (percentLoaded < 100)
        {
            progress.style.width = percentLoaded + '%';
            progress.textContent = percentLoaded + '%';
        }
    }
}

function errorHandler(evt)
{
    switch(evt.target.error.code)
    {
        case evt.target.error.NOT_FOUND_ERR:
            alert('File Not Found!');
            break;
        case evt.target.error.NOT_READABLE_ERR:
            alert('File is not readable');
            break;
        case evt.target.error.ABORT_ERR:
            break; // noop
        default:
            alert('An error occurred reading this file.');
    };
}

