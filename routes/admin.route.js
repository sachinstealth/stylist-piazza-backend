const express = require('express');
const router = express.Router();

const admin_controller = require('../controller/admin/adminAuthController.js');
const category_controller = require('../controller/admin/admincategoryController.js');
const privacy_controller=require('../controller/admin/privacyController.js');
const contact_controller=require('../controller/admin/contactUsController.js');
const count_controller=require('../controller/admin/countController.js');
const service_controller=require('../controller/admin/serviceController.js');


/* auth section routes */
router.post('/addAdmin', admin_controller.addAdmin);
router.post('/adminSignIn', admin_controller.adminSignIn);
router.post('/register', admin_controller.register);
router.post('/login', admin_controller.login);
//router.post('/create', admin_controller.create);
router.get('/test', admin_controller.test);
router.post('/getallusers', admin_controller.getallusers);
router.post('/kycById', admin_controller.kycById);
router.post('/kycverified', admin_controller.kycverified);
router.post('/forgotPassword',admin_controller.forgotPassword);
router.post('/resetPassword',admin_controller.resetPassword);
router.post('/getbookorder',admin_controller.getbookorder);
router.post('/deletecustomer',admin_controller.deletecustomer);



/* category section routes */
router.post('/createCategory',category_controller.uploadImg,category_controller.createCategory);
router.post('/updateCategory',category_controller.uploadImg,category_controller.updateCategory);
router.post('/deleteCategory',category_controller.uploadImg,category_controller.deleteCategory);
router.post('/updateCategoryStatus',category_controller.updateCategoryStatus);
router.get('/getAllCategory',category_controller.getAllCategory)
router.post('/viewCategory',category_controller.viewCategory)
router.post('/GetCategoryById',category_controller.GetCategoryById);
router.get('/searchCategory',category_controller.searchcategory);
router.post('/updateUserStatus',category_controller.updateUserStatus);
router.post('/GetUserById',category_controller.GetUserById);
router.post('/updateKycStatus',category_controller.updateKycStatus);
router.post('/getservices',category_controller.getservices);
router.post('/getskillsbyid',category_controller.getskillsby_id);



/* terms And conditions routes */
router.post('/termsAndConditions',privacy_controller.termsAndConditions);
router.post('/updateTerms',privacy_controller.updateTerms);
router.post('/deleteTerms',privacy_controller.deleteTerms);
router.get('/getAllTerms',privacy_controller.getAllTerms);

/* Contact-us routes */
router.post('/createContact',contact_controller.createContact);
router.get('/getAllContact',contact_controller.getAllContact);
router.get('/getAllleads',contact_controller.getAllleads);
router.post('/deleteContact',contact_controller.deleteContact);

/* Count routes */
router.get('/countCategory',count_controller.countCategory);
router.get('/countUser',count_controller.countUser);

/* Service routes */
router.post('/createService',service_controller.createService);
router.post('/updateService',service_controller.updateService);
router.post('/deleteService',service_controller.deleteService);
router.post('/getServiceById',service_controller.getServiceById);
router.get('/getAllService',service_controller.getAllService);
router.post('/updateServiceStatus',service_controller.updateServiceStatus);

/* skill routes */
router.post('/addservice',category_controller.addservice)
//get gallery
router.post('/get_gallery_byId',category_controller.get_gallery_byId);
router.get('/get_reviews',category_controller.get_reviews);
router.post('/get_reviewsbyid',category_controller.get_reviewsbyid);





module.exports = router;
