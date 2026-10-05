import { Card, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';

interface ProfileDetailItem {
    label: string;
    value: string;
    Icon: React.ElementType;
}

interface ProfileDetailsProps {
    details: ProfileDetailItem[];
}

export default function ProfileDetails({ details }: ProfileDetailsProps) {
    return (
        <Card sx={{ width: '100%' }}>
            <List disablePadding>
                {details.map(({ label, value, Icon }, index) => (
                    <ListItem 
                        key={label} 
                        divider={index < details.length - 1}
                        sx={{ py: 2 }}
                    >
                        <ListItemIcon sx={{ color: 'primary.main' }}>
                            <Icon />
                        </ListItemIcon>
                        <ListItemText 
                            primary={<Typography variant="caption" color="text.secondary">{label}</Typography>} 
                            secondary={<Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>{value}</Typography>} 
                        />
                    </ListItem>
                ))}
            </List>
        </Card>
    );
}
