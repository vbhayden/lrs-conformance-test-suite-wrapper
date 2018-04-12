# LRS Conformance Test Suite Wrapper
This is a NodeJS server application to provide a GUI for interacting with ADL's LRS Conformance Suite.  This project is a wrapper for [ADL's LRS Conformance Test Suite](https://github.com/adlnet/lrs-conformance-test-suite), built to provide a sensible user interface for working with that suite when checking a given LRS's conformance.  

It uses the conformance suite's testing objects to select and run tests on the server side, with JQuery / AJAX polling to check the status of those tests.

**To run this, you will need both Git and NodeJS installed.**  NodeJS Must be version 7 or higher.

# Setup
As this project uses the original Conformance Suite, part of the setup process is just cloning that repository for use.

1. Clone this repository:
```
git clone https://github.com/vbhayden/lrs-conformance-suite-gui
cd lrs-conformance-suite-gui
npm  install
```

2. **From within that folder**, clone the LRS Conformance Test Suite:
```
git clone https://github.com/adlnet/lrs-conformance-test-suite
cd lrs-conformance-test-suite
npm install
```

3. Return to the GUI's root folder and run with:
```
node app.js
```

*This project is not directly affiliated with the ADL Initiative.*
