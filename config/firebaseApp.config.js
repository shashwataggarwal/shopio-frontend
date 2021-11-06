// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: 'AIzaSyBwU3VR-tGSLMgrv4Zutf-7-39jdBKewUg',
  authDomain: 'fcs-project-vendure.firebaseapp.com',
  projectId: 'fcs-project-vendure',
  storageBucket: 'fcs-project-vendure.appspot.com',
  messagingSenderId: '275271819895',
  appId: '1:275271819895:web:a57fc69727e21ea7521c72',
  measurementId: 'G-RDFCR2XFR3',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
