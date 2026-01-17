import {
  Body,
  Button,
  Column,
  Container,
  Html,
  Img,
  Link,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { FC } from 'react';

interface OrganizerResetEmailProps {
  email: string;
  resetLink: string;
}

const OrganizerResetEmail: FC<OrganizerResetEmailProps> = ({
  email,
  resetLink,
}) => {
  return (
    <Tailwind>
      <Html>
        <Body className="bg-gray-100">
          <Container className="my-[40px] mx-auto bg-white rounded shadow p-[20px] max-w-[465px]">
            <Section>
              <Img
                src="https://cdn.certchain.co/certchain.png"
                alt="CertChain"
                className="w-[230px] h-[40px] mx-auto"
                width="300"
                height="100"
              />
            </Section>
            <div className="font-sans">
              <Row>
                <Text className="text-center text-2xl font-bold">
                  Reset Your Password
                </Text>
              </Row>
              <Text className="text-center">
                We received a request to reset your password.
              </Text>
              <Text className="text-center">
                Your registered email is: <strong>{email}</strong>
              </Text>
              <>
                <Text className="text-center">
                  Click the button below to reset your password:
                </Text>
                <Section className="text-center">
                  <Button
                    className="bg-[#4F46E5] mx-auto text-center px-4 rounded-md text-white text-center py-2"
                    href={resetLink}
                  >
                    Reset Password
                  </Button>
                </Section>
                <Text className="text-center text-sm mt-4">
                  If the button doesn't work, copy and paste this link into your
                  browser:
                </Text>
                <Text className="text-center text-xs text-blue-500 break-all">
                  {resetLink}
                </Text>
              </>

              <Text className="text-center mt-4">
                If you didn't request this password reset, please ignore this
                email.
              </Text>
              <Text className="text-center">
                This link will expire in 24 hours.
              </Text>
            </div>

            {/* Footer Section */}
            <Section className="mt-8 border-t pt-4">
              <Row className="text-center">
                <Column align="center">
                  <Link href="https://facebook.com/certchain" className="mx-2">
                    <Img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Facebook_Logo_2023.png/600px-Facebook_Logo_2023.png?20231011121526"
                      alt="Facebook"
                      width="24"
                      height="24"
                    />
                  </Link>
                </Column>
                <Column align="center">
                  <Link href="https://pinterest.com/certchain" className="mx-2">
                    <Img
                      src="https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png?20160129083321"
                      alt="Pinterest"
                      width="24"
                      height="24"
                    />
                  </Link>
                </Column>
                <Column align="center">
                  <Link href="https://twitter.com/certchain" className="mx-2">
                    <Img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/X_logo_2023.svg/300px-X_logo_2023.svg.png?20230819000805"
                      alt="X (Twitter)"
                      width="24"
                      height="24"
                    />
                  </Link>
                </Column>
                <Column align="center">
                  <Link href="https://instagram.com/certchain" className="mx-2">
                    <Img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/600px-Instagram_logo_2022.svg.png?20220518162235"
                      alt="Instagram"
                      width="24"
                      height="24"
                    />
                  </Link>
                </Column>
              </Row>
              <p className="text-center text-xs mt-4">
                <Link
                  href="https://certchain.co/privacy-policy"
                  className="text-gray-500 hover:underline"
                >
                  Privacy Policy
                </Link>
                {' | '}
                <Link
                  href="https://certchain.co/terms-and-conditions"
                  className="text-gray-500 hover:underline"
                >
                  Terms and Conditions
                </Link>
              </p>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

// @ts-expect-error Preview props for testing purposes
OrganizerResetEmail.PreviewProps = {
  email: 'user@example.com',
  resetLink: 'https://certchain.co/reset-password?token=123456',
};

export default OrganizerResetEmail;
