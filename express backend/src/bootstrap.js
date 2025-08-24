import connection from "../DB/connection.js"
import { globalError } from "./utils/errorHandler.js"
import userRouter from '../src/modules/User/user.router.js'
import courseRouter from '../src/modules/Course/course.router.js'
import paymentRouter from'../src/modules/payment/payment.router.js'
import enrollmentRouter from '../src/modules/enrollment/enrollment.router.js'
const bootstrab = (app, express) => {
  
  app.use((req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("multipart/form-data")) {
     
      return next();
    }
    express.json()(req, res, next);
  });
 app.use('/user',userRouter)
 app.use('/course',courseRouter)
 app.use('/payment',paymentRouter)
 app.use('/enrollment',enrollmentRouter)
 app.use(globalError)
 
connection()

}
export default bootstrab