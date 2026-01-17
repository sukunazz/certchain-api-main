import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface CertificateEmailProps {
  userName: string;
  eventName: string;
  certificateId: string;
  eventDate: string;
  organizerName: string;
  certificateUrl: string;
}

export const CertificateEmail = ({
  userName,
  eventName,
  certificateId,
  eventDate,
  organizerName,
  certificateUrl,
}: CertificateEmailProps) => {
  const previewText = `Your certificate for ${eventName} is ready!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Img
              src="https://your-logo-url.com/logo.png"
              width="120"
              height="36"
              alt="Logo"
            />
          </Section>
          <Heading style={heading}>Your Certificate is Ready! 🎉</Heading>
          <Text style={paragraph}>Dear {userName},</Text>
          <Text style={paragraph}>
            Congratulations on completing {eventName}! We're excited to present
            you with your certificate of completion.
          </Text>
          <Section style={certificateBox}>
            <Text style={certificateDetails}>
              Certificate ID: {certificateId}
              <br />
              Event: {eventName}
              <br />
              Date: {eventDate}
              <br />
              Issued by: {organizerName}
            </Text>
          </Section>
          <Section style={buttonContainer}>
            <Link href={certificateUrl} style={button}>
              View Your Certificate
            </Link>
          </Section>
          <Text style={paragraph}>
            You can download and share your certificate using the link above.
            The certificate is also available in your dashboard.
          </Text>
          <Text style={footer}>
            This is an automated message, please do not reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default CertificateEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const logo = {
  margin: '0 auto',
  marginBottom: '32px',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#484848',
  padding: '17px 0 0',
  textAlign: 'center' as const,
};

const paragraph = {
  margin: '0 0 15px',
  fontSize: '15px',
  lineHeight: '1.4',
  color: '#3c4149',
  padding: '0 20px',
};

const certificateBox = {
  background: '#f8f9fa',
  borderRadius: '4px',
  padding: '20px',
  margin: '20px',
};

const certificateDetails = {
  fontSize: '14px',
  lineHeight: '2',
  color: '#3c4149',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
  margin: '0 auto',
};

const footer = {
  fontSize: '12px',
  color: '#8898aa',
  lineHeight: '16px',
  padding: '0 20px',
  textAlign: 'center' as const,
};
