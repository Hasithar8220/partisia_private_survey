# Privacy preserving survey submission via crowdsnap.ai using partisia MPC


This sample code will integrate crowdsnap.ai api to load a survey created using crowdsnap.ai platform.

1) Respondent can login using their personal MPC wallet 
2) Then enter the smart contract id (03b16e903f4b3dd2676e57f32697b5a48d4341343c) 
3) Enter the survey id (934834) in to get survey textbox to load a survey
4) Submit the vote

## Requirements

To be able to run the demo the following setup is required.

* Install partisia MPC wallet extension
* Google chrome browser to load the app and wallet extension
* node.js version v.16.15.0 or newer

## Rules

* Survey should have made public at crowdsnap.ai 
* One MPC account can vote only once, else error will be thrown


## How to run?

To run the example run

```shell
npm install
npm start
```

and view the demo at localhost:8080
