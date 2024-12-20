import {
    VERIFICATION_EMAIL_TEMPLATE,
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE
} from './templates.js';
import { mailtrapClient,  sender } from './mail.config.js';

export const sendVerificationEmail = async (email, token) => {
    const reciver = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: reciver,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{VerificationCode}",token),
            category: "Verification Email",
        });

        console.log("Email sent successfully",response);
    } catch (error){
        console.error(`Error sending verification`, error);
        throw new Error(`Error sending verification email: ${error}`);
    }
};
export const sendWelcomeEmail = async (email, name) => {
	const recipient = [{ email }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			template_uuid: "e65925d1-a9d1-4a40-ae7c-d92b37d593df",
			template_variables: {
				company_info_name: "Spiro",
				name: name,
			},
		});

		console.log("Welcome email sent successfully", response);
	} catch (error) {
		console.error(`Error sending welcome email`, error);

		throw new Error(`Error sending welcome email: ${error}`);
	}
};

export const sendPasswordResetEmail = async (email, resetUrl)=>
{
    const reciver = [{email}];
    try {
        const response = await mailtrapClient.send({
            from: sender,
			to: reciver,
			subject: "Reset your password",
			html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
			category: "Password Reset",
        });
		
    } catch (error) {
        console.error(`Error sending password reset email`, error);

		throw new Error(`Error sending password reset email: ${error}`);
    }
};

export const sendResetSuccessEmail = async (email) => {
	const recipient = [{ email }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Password Reset Successful",
			html: PASSWORD_RESET_SUCCESS_TEMPLATE,
			category: "Password Reset",
		});

		console.log("Password reset email sent successfully", response);
	} catch (error) {
		console.error(`Error sending password reset success email`, error);

		throw new Error(`Error sending password reset success email: ${error}`);
	}
};