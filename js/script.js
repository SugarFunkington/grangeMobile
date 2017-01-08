// This code block allows the user to swipe left or right to navigate through the app
// The page seems to bug when first loaded, but after one refresh functions as expected. 

var navPages = ["homePage", "modulesPage", "timetablePage"];

function changePage(direction) {

    var currentPageId = $(":mobile-pagecontainer").pagecontainer("getActivePage")[0].id;
    var currentPageIndex = navPages.indexOf(currentPageId);
    var nextPageId;
    
    if (direction === "right") {
        nextPageId = navPages[currentPageIndex - 1];
        $(":mobile-pagecontainer").pagecontainer("change", "#" + nextPageId, {transition: "slide", reverse: true});
    } else if (direction === "left") {
        nextPageId = navPages[currentPageIndex + 1];
        $(":mobile-pagecontainer").pagecontainer("change", "#" + nextPageId, {transition: "slide"});
        // if the page is changed to the timetable, it needs to be updated with any new modules that the user has enrolled in. 
        if (currentPageId === 'modulesPage') {
            buildTable();
            fillTimetable();
        }
    }
}

$(document).ready(function() {
   $(document).on("swiperight", function() {
      changePage("right"); 
   }); 
   
   $(document).on("swipeleft", function() {
       changePage("left");
   });
});

// This code block gets the user's location, and then updates the Home page with the local weather. It can be a little slow to load. 
function getWeather() {
    if (navigator && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(userLocated, locationError);
    } else {
        var html = "<div class='ui-bar ui-bar-b'>Location is not supported on this device.</div>";
        $('#weatherSection').html(html);
    }
    
    function userLocated(position) {
        var userLatitude = position.coords.latitude;
        var userLongitude = position.coords.longitude;
        var ajaxURL = "http://api.openweathermap.org/data/2.5/weather?lat=" + userLatitude + "&lon=" + userLongitude + "&appid=13f8d9e655e5f466c57ddb16c86f5e9c";
          // I couldn't get the $.getJSON() function to work with this API, I think it I wasn't passing it all the data that it needed to run. Seems to work fine with $.ajax() though. 
        $.ajax({
            dataType: "json",
            url:ajaxURL,
            success: function(data) {
                $('#cityName').html(data.name + ", " + data.sys.country);
                
                // Set weather graphic
                var weather = data.weather[0].main;
                 $('#weatherDescription').html(weather);
                 
                switch(weather) {
                    case "Clouds":
                        if (data.clouds.all > 65) {
                            // Set weather icon as Cloudy
                            $('#weatherImg').attr('src', 'images/weather-icons/cloudy.svg');
                        } else {
                            // Set weather icon as partially cloudy
                            $('#weatherImg').attr('src', 'images/weather-icons/sun-cloudy.svg');
                        }
                      break;
                    case "Sunny":
                      // Set weather icon as Sunny
                      $('#weatherImg').attr('src', 'images/weather-icons/sunshine.svg');
                      break;
                    case "Rain", "Drizzle":
                      // Set weather icon as Raining
                      $('#weatherImg').attr('src', 'images/weather-icons/raining.svg');
                      break;
                    default:
                        $('#weatherImg').attr('src', 'images/weather-icons/cloudy.svg');
                    break;
                }
                // Set temperature in Celsius
                var temp = data.main.temp;
                temp -= 273.15;
                temp = Math.round(temp);
                $('#temp').html(temp);

                // Set wind speed in KM/H
                var wind = data.wind.speed;
                $('#wind').html(wind + " KM/H");

                // Set the wind direction
                var direction = data.wind.deg;
                switch (true) {
                  case (direction < 22.5):
                    $('#windImg').attr('alt', 'N');
                    $('#windImg').attr('src', 'images/weather-icons/north.svg');
                    break;
                  case (direction < 67.5):
                    $('#windImg').attr('alt', 'NE');
                    $('#windImg').attr('src', 'images/weather-icons/north-east.svg');
                    break;
                  case (direction < 112.5):
                    $('#windImg').attr('alt', 'E');
                    $('#windImg').attr('src', 'images/weather-icons/east.svg');
                    break;
                  case (direction < 157.5):
                    $('#windImg').attr('alt', 'SE');
                    $('#windImg').attr('src', 'images/weather-icons/south-east.svg');
                    break;
                  case (direction < 202.5):
                    $('#windImg').attr('alt', 'S');
                    $('#windImg').attr('src', 'images/weather-icons/south.svg');
                    break;
                  case (direction < 247.5):
                    $('#windImg').attr('alt', 'SW');
                    $('#windImg').attr('src', 'images/weather-icons/south-west.svg');
                    break;
                  case (direction < 292.5):
                    $('#windImg').attr('alt', 'W');
                    $('#windImg').attr('src', 'images/weather-icons/west.svg');
                    break;
                  case (direction < 337.5):
                    $('#windImg').attr('alt', 'NW');
                    $('#windImg').attr('src', 'images/weather-icons/north-west.svg');
                    break;
                  case (direction <= 360):
                    $('#windImg').attr('alt', 'N');
                    $('#windImg').attr('src', 'images/weather-icons/north.svg');
                    break;
                }
            }
        });
    }
    
    //Error handling, in case a user's location is unavailable
    function locationError(error) {
        var html = "<div class='ui-bar ui-bar-b'>";
        switch(error) {
            case 0:
                html += "We can't get your location at this time.";
                break;
            case 1:
                html += "We can't get the weather because you won't let us.";
                break;
            case 2:
                html+= "Position unavailable at this time.";
                break;
            case 3:
                html += "Connection timed out. Try again later.";
            break;
        }
        html += "</div>";
        $('#weatherSection').html(html);
    }
}

// This function gets a quote from a Random Quote Generator API.

function getQuote() {
    // JSON Request
    $.ajax({
      url: 'https://andruxnet-random-famous-quotes.p.mashape.com/?cat=famous',
      type:'POST',
      dataType: 'json',
      success: function(data) {
        // This will take the returned quote and update the DOM with the quote and the author 
        $('#quoteBox').html(data.quote);
        $('#authorName').html('- ' + data.author);
      },
      beforeSend: function(xhr) {
      xhr.setRequestHeader("X-Mashape-Authorization", "SO0DRLSdSMmsh6FNRtKV7wQZCeLep17ZD3PjsnHJUNcYex5duu");
      }
    });
}

$(document).ready(function() {
    getQuote();
    getWeather();
});


// This code gets the day of the week, and sets the timetable for that day. If it is a weekend, the timetable will set for Monday. 

var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function setDay() {
    var d = new Date();
    var today = d.getDay(); 
    // If the day is a weekend, the timetable should open on Monday and display classes
    if (today === 0 || today === 6) {
        today = 1;
    }
    
    $('#day').html(days[today]);
}

$(document).ready(function() {
    setDay();
});

// This function is called on the arrow icons of the timetable. It updates the selected day, and then fills the timetable with classes scheduled for that day. 
function changeDay(direction) {
    var currentDay = document.querySelector('#day').innerHTML;
    var dayIndex = days.indexOf(currentDay);
    
    if (direction === 'right') {
        dayIndex += 1;
        if (dayIndex > 6) {
            dayIndex = 0;
        }
        $('#day').html(days[dayIndex]);
    } else if (direction === 'left') {
        dayIndex -= 1;
        if (dayIndex < 0) {
            dayIndex = 6;
        }
        $('#day').html(days[dayIndex]);
    }
    
//  When the user changes the page, the table must be reloaded with new information in it. 
    buildTable();
    fillTimetable();
}

// This function builds the table section of the timetable

function buildTable() {
    var table = document.getElementById('timetableTable');
    var currentDay = document.getElementById('day');
    // The first step is to create a table with the time in the first column.
    var html;
    html = '<table>';
    for (var i=0; i<10; i++) {
        html += "<tr id='row" + i +"'><td class='width-20 bg-grey text-center'>" + (i+9) + ":00</td></tr>";
    }
    html += '</table>';
    table.innerHTML = html;
    
    // The next step is to create the space for classes to be injected. 
    // If it is a weekend, the page will tell the user that there are no classes today. 
    if (days.indexOf(currentDay.innerHTML) === 0 || days.indexOf(currentDay.innerHTML) === 6) {
        $('#row0').append("<td class='width-80' rowspan='10'>There's no class today, it's a weekend!</td>");
    } else {
        for (var i=0; i<10; i++) {
            var row = '#row' + i;
            $(row).append("<td class='width-80' id='data" + i + "'></td>");
        }        
    }
}

function fillTimetable() {
    var currentDay = document.querySelector('#day').innerHTML;
    $.getJSON('http://localhost/php/json-data-modules.php', function(data) {
        $.each(data.modules, function(index, module) {
            // Compare the current day to the day that the module is scheduled for
            if (currentDay === module.moduleDay) {
                // Get the module time, then use it to set what row in the table to put the information
                var time = module.moduleTime;
                var data = '#data' + (time - 9);
                $(data).html(module.moduleName + "<br><span class='small-text'>" + module.location + ", room " + module.room + "</span");
                $(data).attr('rowspan', '2');
                //Checks to see if a user is enrolled in any modules. If they are, their modules will be highlighted in blue. If the
                //are not, all modules appear orange on the timetable.
                if (studentUser.myModules.length > 0) {
                    for (var i=0; i<studentUser.myModules.length; i++) {
                        if (module.moduleName === studentUser.myModules[i]) {
                            $(data).addClass('bg-module-mymodule');
                        }
                    }
                } else {
                    $(data).addClass('bg-module-none');
                }
                
                // When the added module takes up 2 rows, there is an extra <td> that must be deleted so as not to warp the table. 
                var rowForDelete = 'row' + (time - 8);
                var row = document.getElementById(rowForDelete);
                row.deleteCell(1);
            }
        });
    });
}

$(document).ready(function() {
    buildTable();
    fillTimetable();
});

//This function loads the Modules data and populates the Modules page with it

function getModules() {
    $.getJSON('http://localhost/php/json-data-modules.php', function(data) {
       $.each(data.modules, function(index, module) {
           $('#moduleList').append("<li><a href='#detail' data-rel='dialog' data-transition='flip' onclick='getModuleDetails(this);'>" + module.moduleName + "</a></li>");
           // Each module is added to the otherModules array, which is used to rebuild the module list when a student enrolls. 
           otherModules.push(module.moduleName);
       });
       $('#moduleList').listview('refresh');
    });
}

$(document).ready(function() {
    getModules();
});

// This function is used to get the Module data and use it to create the Module Details dialog box.
function getModuleDetails(module) {
    // This block will take the name of the module from the <ul>, and use it to create the header for the dialog box
    var selectedModule = module.innerHTML;
    var header = document.querySelector('#moduleHeader');
    header.innerHTML = selectedModule;
    
    // This block gets module data, and uses it to populate the detail screen
    $.getJSON('http://localhost/php/json-data-modules.php', function(data) {
        $.each(data.modules, function(index, module) {
            if (module.moduleName === selectedModule) {
                var html; 
                
                // Adds text about the module details to the screen, in the first half of the FlexBox on the dialog page. 
                html = "<p>" + module.moduleName + " takes place in DIT " + module.location + ". It is scheduled for every " + module.moduleDay + " at " + module.moduleTime + ":00, in room " + module.room + ".</p>";
                html += "<p>More information can be found at <a href='" + module.website + "'>" + module.website + "</a>.</p>";
                $('#moduleDescription').html(html);
                
                // Calls the lecturer data, then accesses the lecturer of this particular module. Displays the first and last name on the second half of the flexbox, along with an image. 
                $.getJSON('http://localhost/php/json-data-lecturers.php', function(lectureData) {
                    $.each(lectureData.lecturers, function(index, lecturer) {
                        if (lecturer.moduleNo1 === module.moduleNo || lecturer.moduleNo2 === module.moduleNo) {
                            $('#moduleLecturerInfo').html("<a class='ui-btn ui-btn-b' href='#lecturerDetail' data-rel='dialog' data-transition='slidedown' onclick='getLecturerInfo();'><img src='images/avatar-75.png' class='round-border'><p class='small-text'>Lecturer: <br><span>" + lecturer.firstName + " " + lecturer.lastName + "</span></p></a>");
                        }
                    });
                });         
                
                // Add the number of module credits to the screen.
                $('#credits').html(module.credits);
                
                checkStudentCredits();
            }
        });
    });
}

function getLecturerInfo() {
//    Get the selected lecturer by checking what lecturer is currently being displayed on the screen. Use this to set the header on the dialog box.
    var selectedLecturer = document.querySelector('#moduleLecturerInfo > a > p > span').innerHTML;
    var name = document.querySelector('#lecturerName');
    name.innerHTML = selectedLecturer;
    
//    Get all the lecturer data from the database. Using the same method as the Module details page, the function will compare the selected lecture with each lecture returned.
//    It then calls the module data, and compares that to the current lecturer. It prints out the modules that the lecture teaches in. 
    $.getJSON('http://localhost/php/json-data-lecturers.php', function(data) {
        $.each(data.lecturers, function(index, lecturer) {
           var html;
           var fullname = lecturer.firstName + " " + lecturer.lastName;
           if (fullname === selectedLecturer) {
                html = "<table>";
                html += "<tr><th>Taught Modules</th></tr>";
                
                $.getJSON('http://localhost/php/json-data-modules.php', function(moduleData) {
                    $.each(moduleData.modules, function(index, module) {
                        if (lecturer.moduleNo1 === module.moduleNo || lecturer.moduleNo2 === module.moduleNo) {
                            html += "<tr><td>" + module.moduleName + "</td></tr>";
                        }
                    });
                    html += "</table>";
                    $('#taughtModules').html(html);
                });
           }
        });
    });
}


// This function is called when the user selects a Week to view lecture notes. It populates the Notes dialog with the selected week's notes. 

function getLectureNotes(lecture) {
    var title = lecture.innerHTML;
    $('#lectureNotesHeader').html(title);
    
    var lectureNum = title.substring(0, 6);
    var loremNotes = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet felis nec ipsum \n\
                        rhoncus hendrerit et quis lacus. Fusce aliquam metus sed pellentesque gravida. Praesent tincidunt libero a erat \n\
                        elementum, rhoncus suscipit justo condimentum. Donec rutrum blandit sapien, sit amet ornare sem convallis non. \n\
                        Integer vestibulum, nunc et tincidunt suscipit, nunc mauris lacinia sapien, sit amet pharetra purus nulla in tortor. \n\
                        Sed fringilla metus at nisi semper dictum. Sed eget nunc luctus, elementum augue sit amet, consequat nunc. Nunc \n\
                        interdum metus vitae convallis vehicula. Donec sed sapien mi. Morbi at erat id felis sagittis consectetur.';
    
    $('#lectureNotesInfo').html('Here are the notes for ' + lectureNum + '.<br> ' + loremNotes);
}

//This section allows users to enroll in classes. Once they have earned enough credits, they will no longer be able to enroll. 

var studentUser = {
    studentCredits: 0,
    totalCreditsNeeded: 30,
    myModules: []
};

//This variable will store a list of all modules. It is populated when the initial modules JSON call is made. 
var otherModules = [];

function enrollInModule() {
    var moduleCredits = Number(document.querySelector('#credits').innerHTML);
    var currentModule = document.querySelector('#moduleHeader').innerHTML;    
    // add the selected module to the user's module array
    studentUser.studentCredits += moduleCredits;
    studentUser.myModules.push(currentModule);
    // remove the selected module from the list of other modules
    var index = otherModules.indexOf(currentModule);
    otherModules.splice(index, 1);
    
    rebuildModuleListPage();
}

function rebuildModuleListPage() {
    var html = "<li data-role='list-divider' data-theme='b' id='myModules'>My Modules</li>";
    html += "<li data-role='list-divider' data-theme='b' id='otherModules'>Other Modules</li>";
    $('#moduleList').html(html);
    
    for (var i=0; i<studentUser.myModules.length; i++) {
        $('#myModules').after("<li><a href='#detail' data-rel='dialog' data-transition='flip' onclick='getModuleDetails(this);'>" + studentUser.myModules[i] + "</a></li>");
    }
    
    for (var i=0; i<otherModules.length; i++) {
        $('#otherModules').after("<li><a href='#detail' data-rel='dialog' data-transition='flip' onclick='getModuleDetails(this);'>" + otherModules[i] + "</a></li>");
    }
    
    $('#moduleList').listview('refresh');
    
    if (studentUser.studentCredits < studentUser.totalCreditsNeeded) {
        $('#studentMessage').html('You have enrolled in ' + studentUser.studentCredits + ' credits this semester. You need ' + (studentUser.totalCreditsNeeded - studentUser.studentCredits) + ' more.');
    } else if (studentUser.studentCredits === studentUser.totalCreditsNeeded) {
        $('#studentMessage').remove();
    }
}

// This function checks how many credits a student currently has. If they have too many, the enroll button will be hidden, and a message will be displayed. 
// It also updates the screen if a user opens a module they have already enrolled in. 

function checkStudentCredits() {
    var creditsNeeded = studentUser.totalCreditsNeeded - studentUser.studentCredits;
    var moduleCredits = Number(document.querySelector('#credits').innerHTML);
    var currentModule = document.querySelector('#moduleHeader').innerHTML;
    var modules = studentUser.myModules;
    
    // This if statement checks to see number of student credits.
    if (creditsNeeded <= 0) {
        // if user has 30 credits, prints that to screen
        $('#enrollButton').hide();
        $('#creditsErrorMessage').show().html('You cannot enroll in any more modules this semester.');
    } else if (creditsNeeded < moduleCredits) {
        // If a user needs more credits, but this module has too many, it tells user to pick something else
        $('#enrollButton').hide();
        $('#creditsErrorMessage').show().html('You can only take ' + creditsNeeded + ' more credits. Please choose a different module.');
    } else {
        // If user can enroll, will show the enroll button and hide errors
        $('#enrollButton').show();
        $('#creditsErrorMessage').hide();
    }
    
    //This is statement checks to see what modules a user is currently enrolled in
    if (modules.length !== 0) {
        for (var i=0; i<modules.length; i++) {
            if (currentModule === modules[i]) {
                // compares current module to array of myModules, and updates the screen if a user is already enrolled.
                $('#enrollButton').hide();
                $('#creditsErrorMessage').hide();
                $('#moduleDetailsTheme').addClass("ui-bar-c");
                $('#enrolledModuleIndicator').show();
                return false;
            } else if (currentModule !== modules[i]) {
                $('#moduleDetailsTheme').removeClass("ui-bar-c");
                $('#enrolledModuleIndicator').hide(); 
            }
        }
    }
}