import React, { useState } from 'react';
import { Box, Paper, IconButton, Tooltip } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
  darkMode: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, darkMode }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <Box sx={{ position: 'relative', my: 2 }}>
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
        }}
      >
        <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
          <IconButton
            size="small"
            onClick={copyToClipboard}
            sx={{
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </IconButton>
        </Tooltip>
      </Box>
      <Paper
        sx={{
          overflow: 'hidden',
          borderRadius: 1,
          '& pre': {
            margin: 0,
          },
        }}
      >
        <SyntaxHighlighter
          language={language || 'text'}
          style={darkMode ? atomDark : oneLight}
          showLineNumbers
          customStyle={{
            margin: 0,
            padding: '16px',
            borderRadius: '4px',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </Paper>
    </Box>
  );
};

export default CodeBlock;