import { Card, CardContent, Box, Link as MuiLink } from '@mui/material';
import Typography from '@mui/material/Typography';
import Tag from './Tag';

export default function MatchCard({ match }) {
  return (
    <MuiLink
      href={`/match/${match.uuid}`}
      underline="none"
      sx={{ display: 'block', color: 'inherit', width: 220, height: 320, m: 1 }}
    >
      <Card
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
          position: 'relative',
          background: 'none',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'scale(1.045)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          },
        }}
      >
        {/* 背景图片和遮罩 */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${match.logo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg,rgba(255,255,255,0.7) 60%,rgba(255,255,255,0.95) 100%)',
            zIndex: 1,
          }}
        />
        <CardContent
          sx={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            p: 2,
          }}
        >
          <Typography
            variant="h6"
            title={match.name}
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'normal',
              fontWeight: 700,
              color: '#222',
              mb: 1,
            }}
          >
            {match.name}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {(match.keywords || []).map((keyword, idx) => (
              <Tag key={idx} tag={keyword} />
            ))}
          </Box>
        </CardContent>
      </Card>
    </MuiLink>
  );
}