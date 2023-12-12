const express=require('express');
const usercontroller = require('../controller/user/authController.js');
const servicecontroller = require('../controller/user/serviceController.js');
const category_controller = require('../controller/user/usercategoryController.js');
const stylist_controller=require('../controller/user/stylistController.js');
const appointcontroller=require('../controller/user/appointmentController.js');
const chatcontroller=require('../controller/user/chatcontroller.js');
const router=express.Router();


/*appoint Routes */
router.post('/bookappointment',appointcontroller.verifyToken,appointcontroller.bookappointment);
router.post('/bookorder',appointcontroller.verifyToken,appointcontroller.bookorder);
router.post('/getuserappointment',appointcontroller.verifyToken,appointcontroller.getuserappointment);
router.post('/getstylistappointment',appointcontroller.verifyToken,appointcontroller.getstylistappointment);
router.post('/updateappointment',appointcontroller.verifyToken,appointcontroller.updateappointment);
router.post('/updateappointmenttime',appointcontroller.verifyToken,appointcontroller.updateappointmenttime);
router.post('/getbookingdetailbyid',appointcontroller.verifyToken,appointcontroller.getbookingdetailbyid);
router.post('/bookorder',appointcontroller.verifyToken,appointcontroller.bookorder);
router.post('/deleteappointment',appointcontroller.verifyToken,appointcontroller.deleteappointment);
router.get('/getbookorder',appointcontroller.verifyToken,appointcontroller.getbookorder);
router.post('/updateorder',appointcontroller.verifyToken,appointcontroller.updateorder);
router.post('/cancelbookingreason',appointcontroller.verifyToken,appointcontroller.cancelbookingreason);
// router.post('/message',appointcontroller.verifyToken,chatcontroller.message);
//router.get('/getmessage',chatcontroller.getmessage);
router.post('/getbookinglist',appointcontroller.verifyToken,appointcontroller.getbookinglist);
router.post('/editorder',appointcontroller.verifyToken,appointcontroller.editorder);
router.post('/getappointmentstatus',appointcontroller.verifyToken,appointcontroller.getappointmentstatus);
router.post('/getconfirmappointment',appointcontroller.verifyToken,appointcontroller.getconfirmappointment);
router.post('/getcompleteappointment',appointcontroller.verifyToken,appointcontroller.getcompleteappointment);
router.post('/getuserdeatilbyid',appointcontroller.verifyToken,appointcontroller.getuserdeatilbyid);
//router.post('/cancelorder',appointcontroller.verifyToken,appointcontroller.cancelorder);
router.post('/getappointmentoffer',appointcontroller.verifyToken,appointcontroller.getappointmentoffer);
router.post('/updatebooking',appointcontroller.verifyToken,appointcontroller.updatebooking);
router.post('/getsinglebookingdetailbyid',appointcontroller.verifyToken,appointcontroller.getsinglebookingdetailbyid);



/* Auth Routes */
router.post('/savechatids',usercontroller.verifyToken,usercontroller.savechatids);
router.post('/signup',usercontroller.uploadImg,usercontroller.signup12);
router.post('/contactform',usercontroller.uploadImg,usercontroller.contactform);
router.post('/emailotp',usercontroller.verifyToken,usercontroller.emailotp);
router.post('/emailupdate',usercontroller.verifyToken,usercontroller.emailupdate);
router.post('/phoneupdate',usercontroller.verifyToken,usercontroller.phoneupdate);
router.post('/login1',usercontroller.login1);
router.post('/deleteaccount',usercontroller.deleteaccount);
router.post('/verifyOtp',usercontroller.VerifyOtp);
//router.post('/backgroundimage',usercontroller.backgroundimage);
router.post('/resetPassword',usercontroller.resetPassword);
router.get('/getimageandvedio',usercontroller.getimageandvedio);
router.post('/resendOtp',usercontroller.ResendOtp1);
router.get('/getAll',usercontroller.verifyToken,usercontroller.getAllData);
router.post('/updateProfile',usercontroller.verifyToken,usercontroller.updateProfile);
router.post('/backgroundimage',usercontroller.verifyToken,usercontroller.backgroundimage);
router.post('/updateSecurity',usercontroller.verifyToken,usercontroller.updateSecurity);
router.get('/countrylist',usercontroller.countrylist)
router.post('/kyclist',usercontroller.verifyToken,usercontroller.kyclist);
router.post('/kycupload',usercontroller.verifyToken,usercontroller.kycupload);
router.post('/kycgetall',usercontroller.verifyToken,usercontroller.kycgetall);
router.post('/kycById',usercontroller.verifyToken,usercontroller.kycById);
router.post('/faceimage',usercontroller.verifyToken,usercontroller.faceimage);
//router.post('/faceimage1',usercontroller.verifyToken,usercontroller.uploadImg1,usercontroller.faceimage1);
router.post('/pricefilter',usercontroller.verifyToken,usercontroller.pricefilter);
router.get('/getpricefilter',usercontroller.verifyToken,usercontroller.getpricefilter);
router.post('/getstylistchatlist',usercontroller.verifyToken,usercontroller.getstylistchatlist);
router.post('/getuserchatlist',usercontroller.verifyToken,usercontroller.getuserchatlist);
router.post('/getstylistbycategory',usercontroller.verifyToken,usercontroller.getstylistbycategory);
router.post('/nearbyloaction',usercontroller.verifyToken,usercontroller.nearbyloaction);
router.post('/createcontact',usercontroller.verifyToken,usercontroller.createcontact);





/* Service Routes */
router.post('/createService',servicecontroller.verifyToken,servicecontroller.createService);
router.post('/updateService',servicecontroller.verifyToken,servicecontroller.updateService);
router.post('/getService',servicecontroller.verifyToken,servicecontroller.getService);
router.get('/getAllService',servicecontroller.verifyToken,servicecontroller.getAllService);
router.post('/updateServiceStatus',servicecontroller.verifyToken,servicecontroller.updateServiceStatus);
router.get('/getAllTerms',servicecontroller.verifyToken,servicecontroller.getAllTerms);


/* category section routes */
router.get('/getAllCategory',category_controller.verifyToken,category_controller.getAllCategory)
router.post('/getUserskills',category_controller.verifyToken,category_controller.getUserskills)
//router.post('/GetCategoryById',category_controller.GetCategoryById);
router.get('/searchCategory',category_controller.searchcategory);
router.post('/getskills',category_controller.verifyToken,category_controller.getskills);
router.post('/getskillsbyid',category_controller.verifyToken,category_controller.getskillsby_id);
//router.post('/userskills',category_controller.verifyToken,category_controller.userskills);
router.post('/addservice',category_controller.verifyToken,category_controller.addservice);
router.post('/Updatedservice',category_controller.verifyToken,category_controller.Updatedservice);

/* contact-us routes */


/* stylist routes */
//router.post('/timeAvailability',stylist_controller.verifyToken,stylist_controller.timeAvailability);
router.get('/timeAvailability',stylist_controller.verifyToken,stylist_controller.timeAvailability);
//router.get('/getTimeSlot',stylist_controller.verifyToken,stylist_controller.getTimeSlot);
//router.post('/addTimeSlot',stylist_controller.verifyToken,stylist_controller.addTimeSlot);
router.get('/getAllStylist',stylist_controller.verifyToken,stylist_controller.getAllStylist);
router.post('/getStylistById',stylist_controller.verifyToken,stylist_controller.getStylistById);
router.post('/searchstylist',stylist_controller.verifyToken,stylist_controller.searchstylist);
router.post('/favstylist',stylist_controller.verifyToken,stylist_controller.favstylist);
//router.post('/updatefavstylist',stylist_controller.verifyToken,stylist_controller.updatefavstylist);
router.get('/getfavstylist',stylist_controller.verifyToken,stylist_controller.getfavstylist);
router.post('/addlocation',stylist_controller.verifyToken,stylist_controller.addlocation);
//router.post('/updatelocation',stylist_controller.verifyToken,stylist_controller.updatelocation);
router.get('/getalladdress',stylist_controller.verifyToken,stylist_controller.getalladdress);
router.post('/addstylistreviews',stylist_controller.verifyToken,stylist_controller.addstylistreviews);
router.post('/adduserreviews',stylist_controller.verifyToken,stylist_controller.adduserreviews);
router.post('/getstylistreview',stylist_controller.verifyToken,stylist_controller.getstylistreview);
router.post('/getuserreview',stylist_controller.verifyToken,stylist_controller.getuserreview);
router.post('/deletestylistreview',stylist_controller.verifyToken,stylist_controller.deletestylistreview);
router.post('/updatetimeavailability',stylist_controller.verifyToken,stylist_controller.updatetimeavailability);
router.get('/gettimeavailability',stylist_controller.verifyToken,stylist_controller.gettimeavailability);
//router.get('/getstylistgallery',stylist_controller.verifyToken,stylist_controller.getstylistgallery);
//router.get('/addedithours',stylist_controller.verifyToken,stylist_controller.addedithours);
router.get('/getavailablehours',stylist_controller.verifyToken,stylist_controller.getavailablehours);
router.post('/updateavailablehours',stylist_controller.verifyToken,stylist_controller.updateavailablehours);
router.post('/addtimeavailability',stylist_controller.verifyToken,stylist_controller.addtimeavailability);
router.post('/referandearn',stylist_controller.verifyToken,stylist_controller.referandearn);
//router.post('/getreferralcode',stylist_controller.verifyToken,stylist_controller.getreferralcode);
router.get('/getstylistgallery',stylist_controller.verifyToken,stylist_controller.getstylistgallery);
router.post('/getstylistdetails',stylist_controller.verifyToken,stylist_controller.getstylistdetails);
router.post('/saveuseraddress',stylist_controller.verifyToken,stylist_controller.saveuseraddress);
router.get('/getuseraddress',stylist_controller.verifyToken,stylist_controller.getuseraddress);
router.post('/updateuseraddress',stylist_controller.verifyToken,stylist_controller.updateuseraddress);
router.get('/getgivenreview',stylist_controller.verifyToken,stylist_controller.getgivenreview);
router.get('/getrecievedreview',stylist_controller.verifyToken,stylist_controller.getrecievedreview);
router.get('/getstylistrecievereview',stylist_controller.verifyToken,stylist_controller.getstylistrecievereview);
router.get('/getstylistgivenreview',stylist_controller.verifyToken,stylist_controller.getstylistgivenreview);
router.get('/recommendedstylist',stylist_controller.verifyToken,stylist_controller.recommendedstylist);



module.exports=router;