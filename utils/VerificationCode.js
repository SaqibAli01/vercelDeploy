import randomstring from 'randomstring';

const generateVerificationCode = () => {
    return randomstring.generate({
        length: 6,
        charset: 'numeric',
    });
};

export default generateVerificationCode;