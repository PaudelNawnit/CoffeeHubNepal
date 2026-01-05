# Team Member Images

This folder contains profile images for team members displayed on the About Us page.

## File Naming Convention

Name your image files using the team member's name in lowercase with hyphens:
- `suraj-nepal.jpg` or `suraj-nepal.png`
- `sarthak-bhattarai.jpg`
- `siddhant-giri.jpg`
- etc.

## Image Requirements

- **Format**: PNG or JPG
- **Size**: 200x200px or larger (square aspect ratio recommended)
- **File Size**: Keep under 500KB for optimal performance

## Usage in Code

After uploading images, update the `AboutUs.tsx` file to use local images:

```typescript
import surajNepal from '@/assets/images/team/suraj-nepal.jpg';
import sarthakBhattarai from '@/assets/images/team/sarthak-bhattarai.jpg';
// ... import other images

const TEAM_MEMBERS = [
  { name: "Suraj Nepal", role: "Team Member", image: surajNepal },
  { name: "Sarthak Bhattarai", role: "Strategist", image: sarthakBhattarai },
  // ... other members
];
```

## Current Team Members

1. Suraj Nepal - Nothing
2. Sarthak Bhattarai - Strategist
3. Siddhant Giri - Front End Developer
4. Krrish Nyopane - UI/UX Designer
5. Sachin Jha - Graphic Designer
6. Mukesh Pandey - Graphic Designer
7. Nawnit Poudel - Tester
8. Supriya Khadka - App Developer
9. Rajdip Joshi - App Developer
10. Aastha Gaire - Backend Developer
11. Pradip Khanal - Researcher

