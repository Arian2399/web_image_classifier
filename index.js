let net;
const webcamElement =  document.getElementById('webcam')
const classifier = knnClassifier.create();
async function app() {
  

  document.getElementById('counta').innerText = `
    Images of type A: 0
  `;
  document.getElementById('countb').innerText = `
    Images of type B: 0
  `;
  document.getElementById('countc').innerText = `
    Images of type C: 0
  `;
  console.log('Loading mobilenet..');

  // Load the model.

  net = await mobilenet.load();

  console.log('Sucessfully loaded model');


  await setupWebcam();
  document.getElementById('console').style.color="white";
  document.getElementById('console').style.textAlign = "center";
  document.getElementById('console').innerText = `
    Prediction: no Data given yet\n
  `;

  // Reads an image from the webcam and associates it with a specific class
  // index.
  const addExample = classId => {
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(webcamElement, 'conv_preds');

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, classId);
  };

  // When clicking a button, add an example for that class.
  document.getElementById('class-a').addEventListener('click', () => addExample(0));
  document.getElementById('class-b').addEventListener('click', () => addExample(1));
  document.getElementById('class-c').addEventListener('click', () => addExample(2));

  while (true) {
    if (classifier.getNumClasses() > 0) {
      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(webcamElement, 'conv_preds');
      // Get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation);

      let images = classifier.getClassExampleCount();

      const classes = ['A', 'B', 'C'];
      document.getElementById('console').innerText = `
        Prediction: ${classes[result.classIndex]}\n
        Probability: ${result.confidences[result.classIndex]}
      `;


      if(images[0]>0){document.getElementById('counta').innerText = `
        Images of type A: ${images[0]}
      `;
    }
    if (images[1]>0){
      document.getElementById('countb').innerText = `
        Images of type B: ${images[1]}
      `;
    }
    if(images[2]>0){
      document.getElementById('countc').innerText = `
        Images of type C: ${images[2]}
      `;
    }
  }


    await tf.nextFrame();
  }
}
async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({video: true},
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata',  () => resolve(), false);
        },
        error => reject());
    } else {
      reject();
    }
  });
}
app();
