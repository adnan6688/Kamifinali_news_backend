import bcrypt from "bcryptjs"
import { envVars } from "../config/env"
import { UserType } from "../modules/User/user.interface"
import { User } from "../modules/User/user.model"


export const seedSuperAdmin = async () => {


    const adminEmail = envVars.ADMIN_EMAIL as string


    const ckAdmin = await User.findOne({ email: adminEmail, role: UserType.ADMIN })

    if (ckAdmin) {
        // eslint-disable-next-line no-console
        console.log('Admin Already Created!')
        return
    }

    // eslint-disable-next-line no-console
    console.log('Admin Creating....')

    const hashPass = await bcrypt.hash(envVars.ADMIN_PASS as string, Number(envVars.PASSWORD_HASH_SALT))

    await User.create({
        name: 'Golam Faruk Adnan',
        role: UserType.ADMIN,
        email: envVars.ADMIN_EMAIL,
        password: hashPass,
        birth_date : '12-06-2004',
        isDelete : false,
        deviceId : null
    })


    // eslint-disable-next-line no-console
    console.log('Admin Created Successfully!')

}