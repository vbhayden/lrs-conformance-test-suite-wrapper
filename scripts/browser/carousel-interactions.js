var carousel = {

    // Get the elements on the carousel
    prevButton: window.$("#carousel-prev"),
    nextButton: window.$("#carousel-next"),

    toSetup: document.getElementById("slide-to-setup"),
    toTestSelection: document.getElementById("slide-to-test-selection"),
    toProgress: document.getElementById("slide-to-progress"),
    toResults: document.getElementById("slide-to-results"),

    // Hide the buttons
    hidePrevButton: function() {
        // Get the button that moves to the previous carousel item
        this.prevButton.hide();
    },
    hideNextButton: function() {
        // Get the button that moves to the next carousel item
        this.nextButton.hide();
    },

    // Show the buttons
    showPrevButton: function() {
        // Get the button that moves to the previous carousel item
        this.prevButton.show();
    },
    showNextButton: function() {
        // Get the button that moves to the next carousel item
        this.nextButton.show();
    },

    // Move to the Setup page
    showSetup: function() {
        // Get the list item that moves us there
        this.toSetup.click();

        // Hide the leftmost carousel button
        this.hidePrevButton();
        this.showNextButton();
    },

    showTestSelection: function() {
        // Get the list item that moves us there
        this.toTestSelection.click();

        this.showPrevButton();
        this.showNextButton();
    },

    showProgress: function() {
        // Get the list item that moves us there
        this.toProgress.click();

        this.showPrevButton();
        this.showNextButton();
    },

    showResults: function() {
        // Get the list item that moves us there
        this.toResults.click();

        // Hide the rightmost carousel button
        this.hideNextButton();
        this.showPrevButton();
    },
}

// Update visibility for the side buttons when things move around
function updateButtonVisibility() {

    // Workaround for all browsers
    function hasClass(element, className) {
        return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
    }

    // The active one will have "active" in its class
    if (hasClass(carousel.toSetup, "active")) {
        carousel.hidePrevButton();
        carousel.showNextButton();
    }

    if (hasClass(carousel.toTestSelection, "active")) {
        carousel.showPrevButton();
        carousel.showNextButton();
    }

    if (hasClass(carousel.toProgress, "active")) {
        carousel.showPrevButton();
        carousel.showNextButton();
    }

    if (hasClass(carousel.toResults, "active")) {
        carousel.showPrevButton();
        carousel.hideNextButton();
    }
}

// Lastly, we'll attach the visibility calls to those buttons' current events
carousel.prevButton.click(function(e){

    carousel.hidePrevButton();
    carousel.hideNextButton();
    setTimeout(updateButtonVisibility, 500);

});

carousel.nextButton.click(function(e){

    carousel.hidePrevButton();
    carousel.hideNextButton();
    setTimeout(updateButtonVisibility, 500);

});

// When we start, move to the setup page
carousel.hideNextButton();
carousel.hidePrevButton();
carousel.showSetup();

// Then assign this
document.carousel = carousel;
