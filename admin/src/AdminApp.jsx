
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import {
    AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText,
    Container, Grid, Paper, Button, TextField, TableContainer, Table, TableHead,
    TableRow, TableCell, TableBody, IconButton, Switch, FormControlLabel,
    Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, InputLabel,
    FormControl, Tabs, Tab, Box, CircularProgress, Chip, Stack, InputAdornment,
    LinearProgress, CssBaseline, Card, CardContent, Link, OutlinedInput, Divider
} from '@mui/material';
import {
    Menu as MenuIcon, Dashboard, ShoppingBag, People, Receipt,
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    ShoppingCart as CartIcon, Inventory as ProductIcon, PersonAdd,
    Category as CategoryIcon, Diamond as GemIcon, Watch as JewelryIcon,
    Settings as SettingsIcon, CloudUpload as UploadIcon,
    ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon, Close as CloseIcon,
    ViewCarousel as CarouselIcon, Article as BookIcon, Collections as CollectionIcon, Description as PageIcon,
    ContactMail as ContactIcon, Menu as NavigationIcon, TextFields as FontIcon,
    Logout as LogoutIcon, Search as SearchIcon, Visibility as VisibilityIcon, Visibility, VisibilityOff, DragIndicator
} from '@mui/icons-material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { API_URL } from './config';

const drawerWidth = 260;

// --- CUSTOM UPLOAD ADAPTER FOR CKEDITOR ---
class CustomUploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    upload() {
        return this.loader.file
            .then(file => new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append('file', file);

                fetch(`${API_URL}/api/upload`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(err => reject(err.error || 'Upload failed'));
                        }
                        return response.json();
                    })
                    .then(data => {
                        resolve({
                            default: data.url
                        });
                    })
                    .catch(error => {
                        reject(error);
                    });
            }));
    }

    abort() {
        // Can handle abort if needed
    }
}

function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new CustomUploadAdapter(loader);
    };
}

// --- SINGLE IMAGE UPLOAD COMPONENT ---
const SingleImageUpload = ({ value, onChange, label }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                toast.error('Upload failed: ' + (err.error || 'Unknown error'));
            } else {
                const data = await res.json();
                onChange(data.url); // Pass back the URL
            }
        } catch (error) {
            console.error('Upload error', error);
            toast.error('Upload Error');
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    return (
        <Box>
            <TextField
                fullWidth
                label={label}
                name="image"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <Button
                                component="label"
                                variant="contained"
                                size="small"
                                disabled={uploading}
                                startIcon={<UploadIcon />}
                            >
                                {uploading ? '...' : 'Upload'}
                                <input type="file" hidden accept="image/*" onChange={handleFileSelect} />
                            </Button>
                        </InputAdornment>
                    ),
                }}
            />
            {uploading && <LinearProgress sx={{ mt: 0.5 }} />}
            {value && (
                <Box sx={{ mt: 1, width: 100, height: 100, border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                    <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
            )}
        </Box>
    );
};

// --- MULTI IMAGE UPLOAD COMPONENT ---
const ImageUpload = ({ gallery, setGallery }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const newImages = [];
            for (let file of files) {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch(`${API_URL}/api/upload`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                if (!res.ok) {
                    const err = await res.json();
                    toast.error('Upload failed: ' + (err.error || 'Unknown error'));
                    continue;
                }

                const data = await res.json();
                newImages.push({ url: data.url, public_id: data.public_id });
            }
            setGallery(prev => [...prev, ...newImages]);
        } catch (error) {
            console.error('Upload error', error);
            toast.error('Upload Error');
        } finally {
            setUploading(false);
            e.target.value = null; // Reset input
        }
    };

    const removeImage = (index) => {
        setGallery(prev => prev.filter((_, i) => i !== index));
    };

    const moveImage = (index, direction) => {
        const newGallery = [...gallery];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= newGallery.length) return;

        [newGallery[index], newGallery[newIndex]] = [newGallery[newIndex], newGallery[index]];
        setGallery(newGallery);
    };

    return (
        <Box sx={{ mt: 2, mb: 2, p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Thư viện ảnh (Upload nhiều ảnh, Sắp xếp)</Typography>

            <Button variant="contained" component="label" startIcon={<UploadIcon />} disabled={uploading}>
                {uploading ? 'Đang tải lên...' : 'Chọn Ảnh'}
                <input type="file" hidden multiple accept="image/*" onChange={handleFileSelect} />
            </Button>
            {uploading && <LinearProgress sx={{ mt: 1 }} />}

            <Grid container spacing={2} sx={{ mt: 2 }}>
                {gallery.map((img, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                        <Box sx={{ position: 'relative', border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                            <img src={img.url} alt="Uploaded" style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />

                            <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: '#eee', p: 0.5 }}>
                                <IconButton size="small" onClick={() => moveImage(index, -1)} disabled={index === 0}><ArrowBackIcon fontSize="small" /></IconButton>
                                <IconButton size="small" color="error" onClick={() => removeImage(index)}><CloseIcon fontSize="small" /></IconButton>
                                <IconButton size="small" onClick={() => moveImage(index, 1)} disabled={index === gallery.length - 1}><ArrowForwardIcon fontSize="small" /></IconButton>
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};


const AdminApp = () => {
    const { user, loading, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Show loading state
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <LinearProgress sx={{ width: '50%' }} />
            </Box>
        );
    }

    // Show login if not authenticated
    if (!user) {
        return <Login />;
    }

    return <AuthenticatedAdminApp user={user} logout={logout} />;
};

const AuthenticatedAdminApp = ({ user, logout }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Data State
    const [stats, setStats] = useState({ orders: 17, newOrders: 12, users: 3, products: 0 });
    const [items, setItems] = useState([]);

    // Dropdown Data
    const [gemstoneCategories, setGemstoneCategories] = useState([]);
    const [jewelryCategories, setJewelryCategories] = useState([]);

    // For Collection Selector
    const [allGemstones, setAllGemstones] = useState([]);
    const [allJewelry, setAllJewelry] = useState([]);

    // Form State
    const [openDialog, setOpenDialog] = useState(false);
    const [openSectionConfigDialog, setOpenSectionConfigDialog] = useState(false);
    const [openJewelrySectionConfigDialog, setOpenJewelrySectionConfigDialog] = useState(false);
    const [openCollectionSectionConfigDialog, setOpenCollectionSectionConfigDialog] = useState(false);
    const [openHeroConfigDialog, setOpenHeroConfigDialog] = useState(false);
    const [openMenuConfigDialog, setOpenMenuConfigDialog] = useState(false);
    const [openGlobalFontConfigDialog, setOpenGlobalFontConfigDialog] = useState(false);
    const [openContactFormConfigDialog, setOpenContactFormConfigDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});

    // Settings State
    const [settings, setSettings] = useState({ CLOUD_NAME: '', API_KEY: '', API_SECRET: '', UPLOAD_PRESET: '', GEM_GRID_COLUMNS: '4', JEWELRY_GRID_COLUMNS: '4', COLLECTION_GRID_COLUMNS: '4' });

    // Password Change State
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const handleLogout = async () => {
        await logout();
        toast.info('Đã đăng xuất');
    };

    useEffect(() => {
        loadDataForTab();
        fetchDropdowns();
        loadSettings(); // Load settings for all tabs to use in section config dialogs
    }, [activeTab]);

    const fetchDropdowns = async () => {
        try {
            const [gemCats, jewCats] = await Promise.all([
                fetch(`${API_URL}/api/gemstone-categories`, { credentials: 'include' }).then(res => res.json()),
                fetch(`${API_URL}/api/jewelry-categories`, { credentials: 'include' }).then(res => res.json())
            ]);
            setGemstoneCategories(gemCats);
            setJewelryCategories(jewCats);
        } catch (error) {
            console.error('Error fetching dropdowns:', error);
        }
    };

    const loadDataForTab = async () => {
        let endpoint = '';
        if (activeTab === 'settings') {
            loadSettings();
            return;
        }

        switch (activeTab) {
            case 'products': endpoint = '/api/gemstones'; break;
            case 'jewelry': endpoint = '/api/jewelry-items'; break;
            case 'gem-categories': endpoint = '/api/gemstone-categories'; break;
            case 'jewelry-categories': endpoint = '/api/jewelry-categories'; break;
            case 'hero-slides': endpoint = '/api/hero-slides'; break; // Hero Slides
            case 'menu': endpoint = '/api/navbar-items/all'; break; // Navbar Menu Items
            case 'blogs': endpoint = '/api/posts'; break;
            case 'pages': endpoint = '/api/pages'; break;
            case 'collections': endpoint = '/api/collections'; break;
            case 'contacts': endpoint = '/api/contact-requests'; break;
            default: return;
        }

        try {
            const res = await fetch(`${API_URL}${endpoint}`, { credentials: 'include' });
            const data = await res.json();

            // Handle new blog API response format
            if (activeTab === 'blogs' && data.posts) {
                setItems(data.posts);
            } else {
                setItems(data);
            }

            if (activeTab === 'products' || activeTab === 'jewelry') {
                setStats(prev => ({ ...prev, products: data.length }));
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const loadSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/api/settings`, { credentials: 'include' });
            const data = await res.json();
            setSettings(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // --- FORM HANDLERS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // CKEditor Change Handler
    const handleEditorChange = (key) => (event, editor) => {
        const data = editor.getData();
        setFormData(prev => ({ ...prev, [key]: data }));
    };

    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const saveSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/api/settings`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) toast.success('Đã lưu cấu hình!');
            else toast.error('Lỗi khi lưu cấu hình');
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const handlePasswordChange = async () => {
        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mật khẩu mới không khớp');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/change-password`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Đổi mật khẩu thành công!');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.error || 'Lỗi khi đổi mật khẩu');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error('Lỗi khi đổi mật khẩu');
        }
    };

    const handleOpenDialog = async (item = null) => {
        setEditingId(item ? item.id : null);

        let fullItem = item;
        if (item && (activeTab === 'products' || activeTab === 'jewelry' || activeTab === 'collections' || activeTab === 'pages')) {
            try {
                const endpoint = activeTab === 'products' ? `/api/gemstones/${item.id}` :
                    activeTab === 'jewelry' ? `/api/jewelry-items/${item.id}` :
                        activeTab === 'pages' ? `/api/pages/${item.id}` :
                            `/api/collections/${item.id}`;
                const res = await fetch(`${API_URL}${endpoint}`, { credentials: 'include' });
                if (res.ok) fullItem = await res.json();
            } catch (err) { console.error(err); }
        }

        // Load all products for selector if collections
        if (activeTab === 'collections') {
            try {
                const [gems, jews] = await Promise.all([
                    fetch(`${API_URL}/api/gemstones`, { credentials: 'include' }).then(r => r.json()),
                    fetch(`${API_URL}/api/jewelry-items`, { credentials: 'include' }).then(r => r.json())
                ]);
                setAllGemstones(gems);
                setAllJewelry(jews);
            } catch (e) { console.error(e); }
        }

        // Initialize Form Data
        if (activeTab === 'products') {
            setFormData(fullItem ? {
                title: fullItem.title, gemstone_category_id: fullItem.gemstone_category_id || '',
                image: fullItem.image, price: fullItem.price, description: fullItem.description,
                weight: fullItem.weight, dimensions: fullItem.dimensions,
                color: fullItem.color, clarity: fullItem.clarity,
                cut: fullItem.cut, origin: fullItem.origin,
                gallery: fullItem.gallery || []
            } : {
                title: '', gemstone_category_id: '', image: '', price: '', description: '',
                weight: '', dimensions: '', color: '', clarity: '', cut: '', origin: '',
                gallery: []
            });
        } else if (activeTab === 'jewelry') {
            setFormData(fullItem ? {
                title: fullItem.title, jewelry_category_id: fullItem.jewelry_category_id || '',
                image: fullItem.image, price: fullItem.price, description: fullItem.description,
                gemstone_category_ids: fullItem.composition ? fullItem.composition.map(c => c.id) : [],
                gallery: fullItem.gallery || []
            } : {
                title: '', jewelry_category_id: '', image: '', price: '', description: '',
                gemstone_category_ids: [], gallery: []
            });
        } else if (activeTab === 'gem-categories' || activeTab === 'jewelry-categories') {
            setFormData(fullItem ? { name: fullItem.name, description: fullItem.description } : { name: '', description: '' });
        } else if (activeTab === 'hero-slides') {
            setFormData(fullItem ? {
                image_url: fullItem.image_url, title: fullItem.title,
                subtitle: fullItem.subtitle, link: fullItem.link, sort_order: fullItem.sort_order
            } : {
                image_url: '', title: '', subtitle: '', link: '', sort_order: 0
            });
        } else if (activeTab === 'blogs') {
            setFormData(fullItem ? {
                title: fullItem.title, excerpt: fullItem.excerpt, content: fullItem.content,
                image_url: fullItem.image_url
            } : {
                title: '', excerpt: '', content: '', image_url: ''
            });
        } else if (activeTab === 'collections') {
            setFormData(fullItem ? {
                title: fullItem.title, description: fullItem.description, image: fullItem.image,
                is_visible: fullItem.is_visible !== 0, // ensure bool
                items: fullItem.items || [] // items fetched from /id
            } : {
                title: '', description: '', image: '', is_visible: true, items: []
            });
        } else if (activeTab === 'pages') {
            setFormData(fullItem ? {
                title: fullItem.title, slug: fullItem.slug, content: fullItem.content,
                is_visible: fullItem.is_visible !== 0
            } : {
                title: '', slug: '', content: '', is_visible: true
            });
        } else if (activeTab === 'menu') {
            setFormData(fullItem ? {
                label: fullItem.label || '',
                type: fullItem.type || 'custom',
                identifier: fullItem.identifier || '',
                url: fullItem.url || '',
                parent_id: fullItem.parent_id || null,
                sort_order: fullItem.sort_order || 0,
                is_visible: fullItem.is_visible !== false,
                icon: fullItem.icon || '',
                open_in_new_tab: fullItem.open_in_new_tab || false
            } : {
                label: '',
                type: 'custom',
                identifier: '',
                url: '',
                parent_id: null,
                sort_order: 0,
                is_visible: true,
                icon: '',
                open_in_new_tab: false
            });
        } else if (activeTab === 'contacts') {
            // For contacts, we only edit (no add new), so item should always exist
            setFormData(fullItem ? {
                id: fullItem.id,
                salutation: fullItem.salutation || '',
                phone: fullItem.phone || '',
                email: fullItem.email || '',
                subject: fullItem.subject || '',
                message: fullItem.message || '',
                selected_gemstones: fullItem.selected_gemstones || [],
                selected_jewelry: fullItem.selected_jewelry || [],
                status: fullItem.status || 'new',
                admin_notes: fullItem.admin_notes || '',
                created_at: fullItem.created_at
            } : {
                id: null,
                salutation: '',
                phone: '',
                email: '',
                subject: '',
                message: '',
                selected_gemstones: [],
                selected_jewelry: [],
                status: 'new',
                admin_notes: '',
                created_at: null
            });
        }

        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSubmit = async () => {
        let endpoint = '';
        if (activeTab === 'products') endpoint = '/api/gemstones';
        else if (activeTab === 'jewelry') endpoint = '/api/jewelry-items';
        else if (activeTab === 'gem-categories') endpoint = '/api/gemstone-categories';
        else if (activeTab === 'jewelry-categories') endpoint = '/api/jewelry-categories';
        else if (activeTab === 'hero-slides') endpoint = '/api/hero-slides';
        else if (activeTab === 'menu') endpoint = '/api/navbar-items';
        else if (activeTab === 'blogs') endpoint = '/api/posts';
        else if (activeTab === 'collections') endpoint = '/api/collections';
        else if (activeTab === 'pages') endpoint = '/api/pages';
        else if (activeTab === 'contacts') endpoint = '/api/contact-requests';

        const url = editingId ? `${API_URL}${endpoint}/${editingId}` : `${API_URL}${endpoint}`;
        const method = editingId ? 'PUT' : 'POST';

        const payload = { ...formData };

        // For contacts, only send status and admin_notes (read-only form)
        if (activeTab === 'contacts') {
            const contactPayload = {
                status: formData.status,
                admin_notes: formData.admin_notes
            };

            try {
                const res = await fetch(url, {
                    method,
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(contactPayload)
                });

                if (res.ok) {
                    loadDataForTab();
                    handleCloseDialog();
                    toast.success('Cập nhật thành công!');
                } else {
                    toast.error('Có lỗi xảy ra!');
                }
            } catch (error) {
                console.error('Error saving:', error);
            }
            return;
        }

        if ((activeTab === 'products' || activeTab === 'jewelry') && !payload.image && payload.gallery && payload.gallery.length > 0) {
            // Optional: still fallback to gallery[0] if no main image
        }

        try {
            const res = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                loadDataForTab();
                handleCloseDialog();
                toast.success(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
            } else {
                toast.error('Có lỗi xảy ra!');
            }
        } catch (error) {
            console.error('Error saving:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return;

        let endpoint = '';
        if (activeTab === 'products') endpoint = '/api/gemstones';
        else if (activeTab === 'jewelry') endpoint = '/api/jewelry-items';
        else if (activeTab === 'gem-categories') endpoint = '/api/gemstone-categories';
        else if (activeTab === 'jewelry-categories') endpoint = '/api/jewelry-categories';
        else if (activeTab === 'hero-slides') endpoint = '/api/hero-slides';
        else if (activeTab === 'menu') endpoint = '/api/navbar-items';
        else if (activeTab === 'pages') endpoint = '/api/pages';
        else if (activeTab === 'contacts') endpoint = '/api/contact-requests';

        try {
            await fetch(`${API_URL}${endpoint}/${id}`, { method: 'DELETE', credentials: 'include' });
            loadDataForTab();
            toast.success('Xóa thành công!');
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Có lỗi xảy ra!');
        }
    };

    const drawer = (
        <div>
            <Toolbar sx={{ backgroundColor: '#1e1e1e', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', pt: 2, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>ADOFINE JEWELRY</Typography>
                <Typography variant="caption" sx={{ color: '#aaa' }}>Admin Console</Typography>
            </Toolbar>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #ddd', bgcolor: '#f5f5f5' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</Box>
                <Box>
                    <Typography variant="subtitle2">Admin User</Typography>
                    <Typography variant="caption" color="textSecondary">Administrator</Typography>
                </Box>
            </Box>
            <List>
                <ListItem button selected={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
                    <ListItemIcon><Dashboard /></ListItemIcon>
                    <ListItemText primary="Bảng điều khiển" />
                </ListItem>
                <Typography variant="overline" sx={{ px: 2, mt: 2, color: '#888', display: 'block' }}>Quản lý Sản phẩm</Typography>
                <ListItem button selected={activeTab === 'products'} onClick={() => setActiveTab('products')}>
                    <ListItemIcon><GemIcon /></ListItemIcon>
                    <ListItemText primary="Đá Quý (Gemstones)" />
                </ListItem>
                <ListItem button selected={activeTab === 'jewelry'} onClick={() => setActiveTab('jewelry')}>
                    <ListItemIcon><JewelryIcon /></ListItemIcon>
                    <ListItemText primary="Trang Sức (Jewelry)" />
                </ListItem>
                <ListItem button selected={activeTab === 'collections'} onClick={() => setActiveTab('collections')}>
                    <ListItemIcon><CollectionIcon /></ListItemIcon>
                    <ListItemText primary="Bộ sưu tập (Collections)" />
                </ListItem>

                <Typography variant="overline" sx={{ px: 2, mt: 2, color: '#888', display: 'block' }}>Quản lý Danh mục</Typography>
                <ListItem button selected={activeTab === 'gem-categories'} onClick={() => setActiveTab('gem-categories')}>
                    <ListItemIcon><CategoryIcon /></ListItemIcon>
                    <ListItemText primary="Danh mục Đá Quý" />
                </ListItem>
                <ListItem button selected={activeTab === 'jewelry-categories'} onClick={() => setActiveTab('jewelry-categories')}>
                    <ListItemIcon><CategoryIcon /></ListItemIcon>
                    <ListItemText primary="Danh mục Trang Sức" />
                </ListItem>

                <Typography variant="overline" sx={{ px: 2, mt: 2, color: '#888', display: 'block' }}>Giao diện</Typography>
                <ListItem button selected={activeTab === 'menu'} onClick={() => setActiveTab('menu')}>
                    <ListItemIcon><NavigationIcon /></ListItemIcon>
                    <ListItemText primary="Quản lý Menu" />
                </ListItem>
                <ListItem button selected={activeTab === 'hero-slides'} onClick={() => setActiveTab('hero-slides')}>
                    <ListItemIcon><CarouselIcon /></ListItemIcon>
                    <ListItemText primary="Quản lý Hero Slide" />
                </ListItem>
                <ListItem button selected={activeTab === 'blogs'} onClick={() => setActiveTab('blogs')}>
                    <ListItemIcon><BookIcon /></ListItemIcon>
                    <ListItemText primary="Quản lý Tin tức" />
                </ListItem>
                <ListItem button selected={activeTab === 'pages'} onClick={() => setActiveTab('pages')}>
                    <ListItemIcon><PageIcon /></ListItemIcon>
                    <ListItemText primary="Quản lý Trang tĩnh" />
                </ListItem>
                <ListItem button selected={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')}>
                    <ListItemIcon><ContactIcon /></ListItemIcon>
                    <ListItemText primary="Liên hệ thiết kế" />
                </ListItem>
                <ListItem button selected={activeTab === 'fonts'} onClick={() => setActiveTab('fonts')}>
                    <ListItemIcon><FontIcon /></ListItemIcon>
                    <ListItemText primary="Quản lý Font" />
                </ListItem>

                <Typography variant="overline" sx={{ px: 2, mt: 2, color: '#888', display: 'block' }}>Hệ thống</Typography>
                <ListItem button selected={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
                    <ListItemIcon><SettingsIcon /></ListItemIcon>
                    <ListItemText primary="Cấu hình (Settings)" />
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, bgcolor: '#fff', color: '#333', boxShadow: 1 }}>
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, textTransform: 'uppercase', fontSize: '1rem', fontWeight: 'bold' }}>
                        {activeTab === 'dashboard' ? 'Bảng điều khiển' :
                            activeTab === 'settings' ? 'Cấu hình Hệ thống' :
                                activeTab === 'products' ? 'Quản lý Đá Quý' :
                                    activeTab === 'jewelry' ? 'Quản lý Trang Sức' :
                                        activeTab === 'hero-slides' ? 'Quản lý Hero Slide' :
                                            activeTab === 'menu' ? 'Quản lý Menu Điều hướng' :
                                                activeTab === 'blogs' ? 'Quản lý Tin tức' :
                                                    activeTab === 'pages' ? 'Quản lý Trang tĩnh' :
                                                        activeTab === 'collections' ? 'Quản lý Bộ sưu tập' :
                                                            activeTab === 'contacts' ? 'Quản lý Liên hệ thiết kế' :
                                                                activeTab === 'gem-categories' ? 'Danh mục Đá Quý' : 'Danh mục Trang Sức'}
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>Đăng xuất</Button>
                </Toolbar>
            </AppBar>

            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
                    {drawer}
                </Drawer>
                <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }} open>
                    {drawer}
                </Drawer>
            </Box>

            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
                <Toolbar />

                {activeTab === 'dashboard' && (
                    <Grid container spacing={3}>
                        {[
                            { title: 'TỔNG ĐƠN HÀNG', value: stats.orders, icon: <CartIcon sx={{ fontSize: 40 }} />, color: '#1976d2' },
                            { title: 'ĐƠN HÀNG MỚI', value: stats.newOrders, icon: <ShoppingBag sx={{ fontSize: 40 }} />, color: '#d32f2f' },
                            { title: 'KHÁCH HÀNG', value: stats.users, icon: <PersonAdd sx={{ fontSize: 40 }} />, color: '#ed6c02' },
                            { title: 'SẢN PHẨM', value: stats.products, icon: <ProductIcon sx={{ fontSize: 40 }} />, color: '#0288d1' }
                        ].map((stat, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card sx={{ height: '100%', color: '#fff', bgcolor: stat.color }}>
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ opacity: 0.8 }}>{stat.title}</Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{stat.value}</Typography>
                                        </Box>
                                        <Box sx={{ opacity: 0.8 }}>{stat.icon}</Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {activeTab === 'fonts' && (
                    <FontManager />
                )}

                {activeTab === 'settings' && (
                    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Cấu hình Logo & Thương hiệu</Typography>
                            <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => setOpenGlobalFontConfigDialog(true)}>
                                Cấu hình Font Hệ thống (Global)
                            </Button>
                        </Box>
                        <Stack spacing={3} sx={{ mb: 4 }}>
                            <SingleImageUpload
                                label="Logo Icon / Ảnh"
                                value={settings.LOGO_IMAGE}
                                onChange={(url) => setSettings(prev => ({ ...prev, LOGO_IMAGE: url }))}
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField label="Tên thương hiệu (Phần 1 - Màu)" name="LOGO_TEXT_PREFIX" value={settings.LOGO_TEXT_PREFIX || ''} onChange={handleSettingsChange} fullWidth placeholder="red" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Tên thương hiệu (Phần 2 - Trắng)" name="LOGO_TEXT_SUFFIX" value={settings.LOGO_TEXT_SUFFIX || ''} onChange={handleSettingsChange} fullWidth placeholder="ART" />
                                </Grid>
                            </Grid>
                            <TextField label="Slogan / Phụ đề logo" name="LOGO_SUBTITLE" value={settings.LOGO_SUBTITLE || ''} onChange={handleSettingsChange} fullWidth placeholder="TRANG SỨC ĐÁ QUÝ" />
                        </Stack>

                        <Typography variant="h6" gutterBottom>Cấu hình Cloudinary (Upload Ảnh)</Typography>
                        <Stack spacing={3} sx={{ mb: 4 }}>
                            <TextField label="Cloud Name" name="CLOUD_NAME" value={settings.CLOUD_NAME} onChange={handleSettingsChange} fullWidth />
                            <TextField label="API Key" name="API_KEY" value={settings.API_KEY} onChange={handleSettingsChange} fullWidth />
                            <TextField label="API Secret" name="API_SECRET" value={settings.API_SECRET} onChange={handleSettingsChange} fullWidth type="password" />
                            <TextField label="Upload Preset" name="UPLOAD_PRESET" value={settings.UPLOAD_PRESET} onChange={handleSettingsChange} fullWidth helperText="Tạo preset 'unsigned' trong Cloudinary Settings > Upload" />
                        </Stack>

                        <Typography variant="h6" gutterBottom>Cấu hình Email (SMTP)</Typography>
                        <Stack spacing={3} sx={{ mb: 4 }}>
                            <TextField
                                label="SMTP Host"
                                name="SMTP_HOST"
                                value={settings.SMTP_HOST || 'smtp.gmail.com'}
                                onChange={handleSettingsChange}
                                fullWidth
                                helperText="Ví dụ: smtp.gmail.com, smtp.sendgrid.net"
                            />
                            <TextField
                                label="SMTP Port"
                                name="SMTP_PORT"
                                value={settings.SMTP_PORT || '587'}
                                onChange={handleSettingsChange}
                                fullWidth
                                type="number"
                                helperText="587 (TLS) hoặc 465 (SSL)"
                            />
                            <TextField
                                label="Email gửi (SMTP User)"
                                name="SMTP_USER"
                                value={settings.SMTP_USER || ''}
                                onChange={handleSettingsChange}
                                fullWidth
                                type="email"
                                helperText="Email dùng để gửi thông báo"
                            />
                            <TextField
                                label="Mật khẩu Email (SMTP Pass)"
                                name="SMTP_PASS"
                                value={settings.SMTP_PASS || ''}
                                onChange={handleSettingsChange}
                                fullWidth
                                type="password"
                                helperText="Gmail: dùng App Password (không phải mật khẩu thường)"
                            />
                            <TextField
                                label="Email nhận liên hệ"
                                name="CONTACT_EMAIL"
                                value={settings.CONTACT_EMAIL || ''}
                                onChange={handleSettingsChange}
                                fullWidth
                                type="email"
                                helperText="Email admin nhận thông báo liên hệ (để trống = dùng SMTP_USER)"
                            />
                        </Stack>

                        <Typography variant="h6" gutterBottom>Cấu hình Footer (Liên hệ)</Typography>
                        <Stack spacing={3} sx={{ mb: 4 }}>
                            <TextField label="Tiêu đề Cột 1 (Liên hệ)" name="FOOTER_CONTACT_TITLE" value={settings.FOOTER_CONTACT_TITLE || 'LIÊN HỆ'} onChange={handleSettingsChange} fullWidth />
                            <TextField label="Địa chỉ" name="FOOTER_ADDRESS" value={settings.FOOTER_ADDRESS || ''} onChange={handleSettingsChange} fullWidth multiline />
                            <TextField label="Số điện thoại" name="FOOTER_PHONE" value={settings.FOOTER_PHONE || ''} onChange={handleSettingsChange} fullWidth />
                            <TextField label="Email" name="FOOTER_EMAIL" value={settings.FOOTER_EMAIL || ''} onChange={handleSettingsChange} fullWidth />
                        </Stack>

                        <Typography variant="h6" gutterBottom>Cấu hình Footer (Giới thiệu & Social)</Typography>
                        <Stack spacing={3} sx={{ mb: 4 }}>
                            <TextField label="Tiêu đề Cột 3 (About Us)" name="FOOTER_ABOUT_TITLE" value={settings.FOOTER_ABOUT_TITLE || 'FOLLOW US'} onChange={handleSettingsChange} fullWidth />
                            <TextField label="Nội dung giới thiệu ngắn" name="FOOTER_ABOUT_TEXT" value={settings.FOOTER_ABOUT_TEXT || ''} onChange={handleSettingsChange} fullWidth multiline rows={3} />

                            <Grid container spacing={2}>
                                <Grid item xs={4}><TextField label="Link Facebook" name="SOCIAL_FB" value={settings.SOCIAL_FB || ''} onChange={handleSettingsChange} fullWidth /></Grid>
                                <Grid item xs={4}><TextField label="Link Twitter/X" name="SOCIAL_TW" value={settings.SOCIAL_TW || ''} onChange={handleSettingsChange} fullWidth /></Grid>
                                <Grid item xs={4}><TextField label="Link Instagram" name="SOCIAL_IG" value={settings.SOCIAL_IG || ''} onChange={handleSettingsChange} fullWidth /></Grid>
                            </Grid>

                            <TextField label="Copyright Text" name="FOOTER_COPYRIGHT" value={settings.FOOTER_COPYRIGHT || '© 2026 RED ART. All rights reserved.'} onChange={handleSettingsChange} fullWidth />
                        </Stack>


                        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Đổi mật khẩu</Typography>
                        <Stack spacing={3} sx={{ mb: 4 }}>
                            <TextField
                                label="Mật khẩu hiện tại"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                fullWidth
                            />
                            <TextField
                                label="Mật khẩu mới"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                fullWidth
                                helperText="Ít nhất 6 ký tự"
                            />
                            <TextField
                                label="Xác nhận mật khẩu mới"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                fullWidth
                            />
                            <Button variant="outlined" onClick={handlePasswordChange} size="large">
                                Đổi mật khẩu
                            </Button>
                        </Stack>

                        <Button variant="contained" onClick={saveSettings} size="large">Lưu Cấu hình</Button>
                    </Paper>
                )}

                {activeTab === 'contacts' && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => setOpenContactFormConfigDialog(true)}>
                                Cấu hình Form
                            </Button>
                        </Box>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#eee' }}>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Danh xưng</TableCell>
                                        <TableCell>Số điện thoại</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Tiêu đề</TableCell>
                                        <TableCell>Trạng thái</TableCell>
                                        <TableCell>Ngày gửi</TableCell>
                                        <TableCell align="right">Hành động</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#999' }}>
                                                Chưa có yêu cầu liên hệ nào
                                            </TableCell>
                                        </TableRow>
                                    ) : items.map((contact) => (
                                        <TableRow key={contact.id}>
                                            <TableCell>#{contact.id}</TableCell>
                                            <TableCell>{contact.salutation || '-'}</TableCell>
                                            <TableCell>{contact.phone}</TableCell>
                                            <TableCell>{contact.email}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{contact.subject}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={
                                                        contact.status === 'new' ? 'Mới' :
                                                            contact.status === 'contacted' ? 'Đã liên hệ' :
                                                                'Hoàn thành'
                                                    }
                                                    color={
                                                        contact.status === 'new' ? 'error' :
                                                            contact.status === 'contacted' ? 'warning' :
                                                                'success'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{new Date(contact.created_at).toLocaleDateString('vi-VN')}</TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" color="primary" onClick={() => handleOpenDialog(contact)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(contact.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {/* MENU MANAGEMENT TAB */}
                {activeTab === 'menu' && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                                Quản lý các mục điều hướng trên thanh menu. Các mục "Fixed" là cố định, chỉ có thể ẩn/hiện.
                            </Typography>
                            <Box>
                                <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => setOpenMenuConfigDialog(true)} sx={{ mr: 2 }}>
                                    Cấu hình Menu
                                </Button>
                                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                                    Thêm menu tùy chỉnh
                                </Button>
                            </Box>
                        </Box>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#eee' }}>
                                        <TableCell>Thứ tự</TableCell>
                                        <TableCell>Label</TableCell>
                                        <TableCell>Loại</TableCell>
                                        <TableCell>URL</TableCell>
                                        <TableCell>Parent</TableCell>
                                        <TableCell align="center">Hiển thị</TableCell>
                                        <TableCell align="right">Hành động</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#999' }}>
                                                Chưa có menu items
                                            </TableCell>
                                        </TableRow>
                                    ) : items.map((item) => (
                                        <React.Fragment key={item.id}>
                                            <TableRow sx={{ bgcolor: item.type === 'fixed' ? '#f5f5f5' : 'white' }}>
                                                <TableCell>{item.sort_order}</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>{item.label}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={item.type === 'fixed' ? 'CỐ ĐỊNH' : 'TÙY CHỈNH'}
                                                        size="small"
                                                        color={item.type === 'fixed' ? 'default' : 'primary'}
                                                    />
                                                </TableCell>
                                                <TableCell>{item.url || (item.identifier ? `Auto (${item.identifier})` : '-')}</TableCell>
                                                <TableCell>-</TableCell>
                                                <TableCell align="center">
                                                    {item.is_visible ? (
                                                        <Visibility color="success" />
                                                    ) : (
                                                        <VisibilityOff color="disabled" />
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog(item)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    {item.type !== 'fixed' && (
                                                        <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            {/* Render children (sub-items) */}
                                            {item.children && item.children.map((child) => (
                                                <TableRow key={child.id} sx={{ bgcolor: '#fafafa' }}>
                                                    <TableCell sx={{ pl: 4 }}>↳ {child.sort_order}</TableCell>
                                                    <TableCell sx={{ pl: 4 }}>{child.label}</TableCell>
                                                    <TableCell>
                                                        <Chip label="SUB-ITEM" size="small" color="secondary" />
                                                    </TableCell>
                                                    <TableCell>{child.url || '-'}</TableCell>
                                                    <TableCell>{item.label}</TableCell>
                                                    <TableCell align="center">
                                                        {child.is_visible ? (
                                                            <Visibility color="success" />
                                                        ) : (
                                                            <VisibilityOff color="disabled" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog(child)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton size="small" color="error" onClick={() => handleDelete(child.id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {activeTab !== 'dashboard' && activeTab !== 'settings' && activeTab !== 'contacts' && activeTab !== 'menu' && activeTab !== 'fonts' && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            {activeTab === 'products' ? (
                                <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => setOpenSectionConfigDialog(true)}>
                                    Cấu hình Section
                                </Button>
                            ) : activeTab === 'jewelry' ? (
                                <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => setOpenJewelrySectionConfigDialog(true)}>
                                    Cấu hình Section
                                </Button>
                            ) : activeTab === 'collections' ? (
                                <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => setOpenCollectionSectionConfigDialog(true)}>
                                    Cấu hình Section
                                </Button>
                            ) : activeTab === 'hero-slides' ? (
                                <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => setOpenHeroConfigDialog(true)}>
                                    Cấu hình Hero
                                </Button>
                            ) : <div />}
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                                Thêm mới
                            </Button>
                        </Box>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#eee' }}>
                                        <TableCell>ID</TableCell>
                                        {(activeTab === 'products' || activeTab === 'jewelry' || activeTab === 'hero-slides' || activeTab === 'blogs' || activeTab === 'collections') && <TableCell>Ảnh</TableCell>}
                                        <TableCell>Tên / Tiêu đề</TableCell>
                                        {activeTab === 'pages' && <TableCell>Slug</TableCell>}
                                        {activeTab === 'pages' && <TableCell>Hiển thị</TableCell>}
                                        {(activeTab === 'products' || activeTab === 'jewelry') && <TableCell>Danh mục</TableCell>}
                                        {activeTab === 'jewelry' && <TableCell>Thành phần Đá</TableCell>}
                                        {(activeTab === 'products' || activeTab === 'jewelry') && <TableCell>Giá</TableCell>}
                                        {(activeTab.includes('categories')) && <TableCell>Mô tả</TableCell>}
                                        {/* Removed Author Header */}
                                        {activeTab === 'hero-slides' && <TableCell>Thứ tự</TableCell>}
                                        <TableCell align="right">Hành động</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>#{item.id}</TableCell>
                                            {(activeTab === 'products' || activeTab === 'jewelry' || activeTab === 'hero-slides' || activeTab === 'blogs' || activeTab === 'collections') && (
                                                <TableCell>
                                                    {(item.image || item.image_url) && <img src={item.image || item.image_url} alt={item.title} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />}
                                                </TableCell>
                                            )}
                                            <TableCell sx={{ fontWeight: 'bold' }}>{item.title || item.name}</TableCell>

                                            {activeTab === 'pages' && <TableCell>{item.slug}</TableCell>}
                                            {activeTab === 'pages' && <TableCell>
                                                <Chip label={item.is_visible ? 'Hiện' : 'Ẩn'} color={item.is_visible ? 'success' : 'default'} size="small" />
                                            </TableCell>}

                                            {(activeTab === 'products') && <TableCell>{item.category_name || item.category}</TableCell>}
                                            {(activeTab === 'jewelry') && <TableCell>{item.category_name}</TableCell>}

                                            {activeTab === 'jewelry' && (
                                                <TableCell>
                                                    {item.composition && item.composition.map(c => (
                                                        <Chip key={c.id} label={c.name} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                                    ))}
                                                </TableCell>
                                            )}

                                            {(activeTab === 'products' || activeTab === 'jewelry') && <TableCell>{item.price}</TableCell>}
                                            {activeTab === 'hero-slides' && <TableCell>{item.sort_order}</TableCell>}
                                            {/* Removed Author Column */}

                                            {(activeTab.includes('categories')) && <TableCell>
                                                {/* Preview description somewhat safely */}
                                                <div style={{ maxHeight: 50, overflow: 'hidden', fontSize: '0.8rem', color: '#666' }}>
                                                    {(item.description || '').replace(/<[^>]+>/g, '')}
                                                </div>
                                            </TableCell>}

                                            <TableCell align="right">
                                                <IconButton color="primary" onClick={() => handleOpenDialog(item)}><EditIcon /></IconButton>
                                                <IconButton color="error" onClick={() => handleDelete(item.id)}><DeleteIcon /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Box>

            {/* SECTION CONFIG DIALOG (For Gemstones) */}
            <SectionConfigDialog
                open={openSectionConfigDialog}
                onClose={() => setOpenSectionConfigDialog(false)}
                settings={settings}
                onChange={handleSettingsChange}
                onSave={() => { saveSettings(); setOpenSectionConfigDialog(false); }}
            />

            {/* SECTION CONFIG DIALOG (For Jewelry) */}
            <JewelrySectionConfigDialog
                open={openJewelrySectionConfigDialog}
                onClose={() => setOpenJewelrySectionConfigDialog(false)}
                settings={settings}
                onChange={handleSettingsChange}
                onSave={() => { saveSettings(); setOpenJewelrySectionConfigDialog(false); }}
            />

            {/* SECTION CONFIG DIALOG (For Collections) */}
            <CollectionSectionConfigDialog
                open={openCollectionSectionConfigDialog}
                onClose={() => setOpenCollectionSectionConfigDialog(false)}
                settings={settings}
                onChange={handleSettingsChange}
                onSave={() => { saveSettings(); setOpenCollectionSectionConfigDialog(false); }}
            />

            <HeroConfigDialog
                open={openHeroConfigDialog}
                onClose={() => setOpenHeroConfigDialog(false)}
                settings={settings}
                onSave={() => { saveSettings(); setOpenHeroConfigDialog(false); }}
                onChange={handleSettingsChange}
                setSettings={setSettings}
            />

            <MenuConfigDialog
                open={openMenuConfigDialog}
                onClose={() => setOpenMenuConfigDialog(false)}
                settings={settings}
                onSave={() => { saveSettings(); setOpenMenuConfigDialog(false); }}
                onChange={handleSettingsChange}
                setSettings={setSettings}
            />

            <GlobalConfigDialog
                open={openGlobalFontConfigDialog}
                onClose={() => setOpenGlobalFontConfigDialog(false)}
                settings={settings}
                onSave={() => { saveSettings(); setOpenGlobalFontConfigDialog(false); }}
                onChange={handleSettingsChange}
                setSettings={setSettings}
            />

            <ContactFormConfigDialog
                open={openContactFormConfigDialog}
                onClose={() => setOpenContactFormConfigDialog(false)}
                config={(() => {
                    try {
                        return settings.CONTACT_FORM_CONFIG ? JSON.parse(settings.CONTACT_FORM_CONFIG) : {
                            title: 'LET US CREATE THE PERFECT CUSTOM JEWELRY PIECE FOR YOU',
                            salutation: { label: 'Danh xưng', placeholder: 'Mr., Mrs., Ms., etc.', required: false },
                            phone: { label: 'Số điện thoại', placeholder: 'Nhập số điện thoại', required: true },
                            email: { label: 'Email', placeholder: 'Nhập địa chỉ email', required: true },
                            subject: { label: 'Tiêu đề', placeholder: 'Mô tả ngắn gọn yêu cầu', required: true },
                            message: { label: 'Nội dung', placeholder: 'Tell us about your custom jewelry design ideas...', required: true }
                        };
                    } catch (e) {
                        return {};
                    }
                })()}
                onSave={async (newConfig) => {
                    const updatedSettings = {
                        ...settings,
                        CONTACT_FORM_CONFIG: JSON.stringify(newConfig)
                    };
                    try {
                        const res = await fetch(`${API_URL}/api/settings`, {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updatedSettings)
                        });
                        if (res.ok) {
                            setSettings(updatedSettings);
                            setOpenContactFormConfigDialog(false);
                            toast.success('Đã lưu cấu hình form!');
                        } else {
                            toast.error('Lỗi khi lưu cấu hình');
                        }
                    } catch (error) {
                        console.error('Error saving form config:', error);
                        toast.error('Lỗi kết nối');
                    }
                }}
            />

            {/* SHARED DIALOG FORM */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
                <DialogTitle>
                    {editingId ? 'Chỉnh sửa' : 'Thêm mới'}
                    {activeTab === 'products' ? ' Đá Quý' :
                        activeTab === 'jewelry' ? ' Trang Sức' :
                            activeTab === 'hero-slides' ? ' Hero Slide' :
                                activeTab === 'menu' ? ' Menu Item' :
                                    activeTab === 'blogs' ? ' Tin tức' :
                                        activeTab === 'pages' ? ' Trang' :
                                            activeTab === 'collections' ? ' Bộ sưu tập' :
                                                activeTab === 'contacts' ? 'Chi tiết liên hệ' : ' Danh mục'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        {/* --- CATEGORY FORM --- */}
                        {(activeTab === 'gem-categories' || activeTab === 'jewelry-categories') && (
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                    📋 Thông tin danh mục
                                </Typography>
                                <Stack spacing={2}>
                                    <TextField fullWidth label="Tên danh mục" name="name" value={formData.name || ''} onChange={handleInputChange} required />
                                    <TextField fullWidth multiline rows={3} label="Mô tả" name="description" value={formData.description || ''} onChange={handleInputChange} />
                                </Stack>
                            </Paper>
                        )}

                        {/* --- HERO SLIDE FORM --- */}
                        {activeTab === 'hero-slides' && (
                            <>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        🖼️ Hình ảnh nền
                                    </Typography>
                                    <SingleImageUpload
                                        label="Ảnh nền (Background Image)"
                                        value={formData.image_url}
                                        onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                                    />
                                </Paper>

                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        📝 Nội dung slide
                                    </Typography>
                                    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} useFlexGap flexWrap="wrap">
                                        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '48%' } }}>
                                            <TextField fullWidth label="Tiêu đề chính" name="title" value={formData.title || ''} onChange={handleInputChange} placeholder="Ví dụ: Tinh hoa & SANG TRỌNG" />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '48%' } }}>
                                            <TextField fullWidth label="Thứ tự hiển thị" name="sort_order" type="number" value={formData.sort_order || 0} onChange={handleInputChange} />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '48%' } }}>
                                            <TextField fullWidth label="Phụ đề (Subtitle)" name="subtitle" value={formData.subtitle || ''} onChange={handleInputChange} placeholder="Ví dụ: CHÀO MỪNG BẠN..." />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '48%' } }}>
                                            <TextField fullWidth label="Link liên kết (Optional)" name="link" value={formData.link || ''} onChange={handleInputChange} placeholder="/portfolio/1" />
                                        </Box>
                                    </Stack>
                                </Paper>
                            </>
                        )}

                        {/* --- COLLECTION FORM --- */}
                        {/* --- COLLECTION FORM --- */}
                        {activeTab === 'collections' && (
                            <>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        📋 Thông tin bộ sưu tập
                                    </Typography>
                                    <Stack spacing={2}>
                                        <TextField fullWidth label="Tên Bộ Sưu Tập" name="title" value={formData.title || ''} onChange={handleInputChange} required />
                                        <TextField fullWidth multiline rows={3} label="Mô tả ngắn" name="description" value={formData.description || ''} onChange={handleInputChange} />
                                        <FormControl fullWidth>
                                            <InputLabel>Hiển thị</InputLabel>
                                            <Select
                                                name="is_visible"
                                                value={formData.is_visible ? 1 : 0}
                                                onChange={(e) => setFormData(prev => ({ ...prev, is_visible: e.target.value === 1 }))}
                                                label="Hiển thị"
                                            >
                                                <MenuItem value={1}>Hiện</MenuItem>
                                                <MenuItem value={0}>Ẩn</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Stack>
                                </Paper>

                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        🖼️ Hình ảnh đại diện
                                    </Typography>
                                    <SingleImageUpload
                                        label="Ảnh Đại Diện (Main Image)"
                                        value={formData.image}
                                        onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                    />
                                </Paper>

                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        💎 Sản phẩm trong Bộ Sưu Tập
                                    </Typography>

                                    {/* Selector */}
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mb={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                                        <FormControl sx={{ minWidth: 120 }} size="small">
                                            <InputLabel>Loại</InputLabel>
                                            <Select
                                                value={formData._tempType || 'gemstone'}
                                                label="Loại"
                                                onChange={(e) => setFormData(p => ({ ...p, _tempType: e.target.value, _tempId: '' }))}
                                            >
                                                <MenuItem value="gemstone">Đá Quý</MenuItem>
                                                <MenuItem value="jewelry">Trang Sức</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <FormControl sx={{ minWidth: 200, flexGrow: 1 }} size="small">
                                            <InputLabel>Sản phẩm</InputLabel>
                                            <Select
                                                value={formData._tempId || ''}
                                                label="Sản phẩm"
                                                onChange={(e) => setFormData(p => ({ ...p, _tempId: e.target.value }))}
                                            >
                                                {(formData._tempType === 'jewelry' ? allJewelry : allGemstones).map(p => (
                                                    <MenuItem key={p.id} value={p.id}>
                                                        {p.title} (#{p.id})
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <Button variant="contained" onClick={() => {
                                            if (!formData._tempId) return;
                                            const type = formData._tempType || 'gemstone';
                                            const list = formData._tempType === 'jewelry' ? allJewelry : allGemstones;
                                            const product = list.find(p => p.id === formData._tempId);

                                            // Add to items
                                            const newItem = {
                                                id: product.id, // product id
                                                type: type,
                                                title: product.title,
                                                image: product.image || product.image_url,
                                                price: product.price
                                            };

                                            setFormData(prev => {
                                                const current = prev.items || [];
                                                // Avoid duplicates
                                                if (current.find(i => i.id === newItem.id && i.type === newItem.type)) return prev;
                                                return { ...prev, items: [...current, newItem], _tempId: '' };
                                            });
                                        }}>Thêm</Button>
                                    </Stack>

                                    {/* List */}
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Ảnh</TableCell>
                                                    <TableCell>Tên</TableCell>
                                                    <TableCell>Loại</TableCell>
                                                    <TableCell align="right">Xóa</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {(formData.items || []).map((item, idx) => (
                                                    <TableRow key={`${item.type}-${item.id}-${idx}`}>
                                                        <TableCell>
                                                            <img src={item.image} alt="" style={{ width: 40, height: 40, obectFit: 'cover' }} />
                                                        </TableCell>
                                                        <TableCell>{item.title}</TableCell>
                                                        <TableCell>{item.type === 'gemstone' ? 'Đá Quý' : 'Trang Sức'}</TableCell>
                                                        <TableCell align="right">
                                                            <IconButton size="small" color="error" onClick={() => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    items: prev.items.filter((_, i) => i !== idx)
                                                                }));
                                                            }}>
                                                                <CloseIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </>
                        )}

                        {/* --- BLOG FORM --- */}
                        {activeTab === 'blogs' && (
                            <>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        📝 Thông tin bài viết
                                    </Typography>
                                    <Stack spacing={2}>
                                        <TextField fullWidth label="Tiêu đề bài viết" name="title" value={formData.title || ''} onChange={handleInputChange} required />
                                        <TextField fullWidth multiline rows={3} label="Tóm tắt (Excerpt)" name="excerpt" value={formData.excerpt || ''} onChange={handleInputChange} />
                                    </Stack>
                                </Paper>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        🖼️ Hình ảnh
                                    </Typography>
                                    <SingleImageUpload
                                        label="Ảnh bài viết (Thumbnail)"
                                        value={formData.image_url}
                                        onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                                    />
                                </Paper>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        📜 Nội dung bài viết
                                    </Typography>
                                    <InputLabel shrink>Nội dung bài viết (Rich Text)</InputLabel>
                                    <div style={{ border: '1px solid #ccc', marginTop: '8px' }}>
                                        <CKEditor
                                            editor={ClassicEditor}
                                            data={formData.content || ''}
                                            config={{
                                                extraPlugins: [MyCustomUploadAdapterPlugin]
                                            }}
                                            onChange={handleEditorChange('content')}
                                        />
                                    </div>
                                </Paper>
                            </>
                        )}

                        {/* --- PAGES FORM --- */}
                        {activeTab === 'pages' && (
                            <>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        📋 Thông tin trang
                                    </Typography>
                                    <Stack spacing={2}>
                                        <TextField fullWidth label="Tiêu đề trang" name="title" value={formData.title || ''} onChange={handleInputChange} required />
                                        <FormControl fullWidth>
                                            <InputLabel>Hiển thị</InputLabel>
                                            <Select
                                                name="is_visible"
                                                value={formData.is_visible ? 1 : 0}
                                                onChange={(e) => setFormData(prev => ({ ...prev, is_visible: e.target.value === 1 }))}
                                                label="Hiển thị"
                                            >
                                                <MenuItem value={1}>Hiện (Trên Menu)</MenuItem>
                                                <MenuItem value={0}>Ẩn</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField fullWidth label="Slug (URL Path) - Để trống để tự tạo" name="slug" value={formData.slug || ''} onChange={handleInputChange} placeholder="vi-du-ve-trang" helperText="Đường dẫn: /pages/slug-nay" />
                                    </Stack>
                                </Paper>

                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        📜 Nội dung trang
                                    </Typography>
                                    <InputLabel shrink>Nội dung trang (Rich Text)</InputLabel>
                                    <div style={{ border: '1px solid #ccc', marginTop: '8px' }}>
                                        <CKEditor
                                            editor={ClassicEditor}
                                            data={formData.content || ''}
                                            config={{
                                                extraPlugins: [MyCustomUploadAdapterPlugin]
                                            }}
                                            onChange={handleEditorChange('content')}
                                        />
                                    </div>
                                </Paper>
                            </>
                        )}

                        {/* --- MENU ITEMS FORM --- */}
                        {activeTab === 'menu' && (
                            <>
                                {/* Warning banner cho fixed items */}
                                {formData.type === 'fixed' && (
                                    <Typography variant="body2" color="warning.main" sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 1, display: 'block', width: '100%' }}>
                                        ⚠️ Đây là mục menu cố định. Bạn chỉ có thể thay đổi thứ tự hiển thị và bật/tắt.
                                    </Typography>
                                )}

                                {/* Section: Thông tin cơ bản */}
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        📝 Thông tin cơ bản
                                    </Typography>
                                    <Stack spacing={2}>
                                        <TextField
                                            fullWidth
                                            label="Tên hiển thị (Label)"
                                            name="label"
                                            value={formData.label || ''}
                                            onChange={handleInputChange}
                                            disabled={formData.type === 'fixed'}
                                            required
                                            placeholder="Về chúng tôi"
                                            helperText={formData.type === 'fixed' ? 'Không thể chỉnh sửa label của mục cố định' : 'Tên sẽ hiển thị trên thanh menu'}
                                        />

                                        {/* Type (chỉ khi không phải fixed) */}
                                        {formData.type !== 'fixed' && (
                                            <FormControl fullWidth>
                                                <InputLabel>Loại</InputLabel>
                                                <Select
                                                    name="type"
                                                    value={formData.type || 'custom'}
                                                    onChange={handleInputChange}
                                                    disabled={editingId}
                                                    label="Loại"
                                                >
                                                    <MenuItem value="custom">URL Tùy chỉnh</MenuItem>
                                                    <MenuItem value="separator">Separator</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}

                                        {/* URL (full width) */}
                                        {formData.type !== 'separator' && formData.type !== 'fixed' && (
                                            <TextField
                                                fullWidth
                                                label="Đường dẫn (URL)"
                                                name="url"
                                                value={formData.url || ''}
                                                onChange={handleInputChange}
                                                placeholder="/about hoặc https://example.com"
                                                helperText="Đường dẫn nội bộ (ví dụ: /about) hoặc URL đầy đủ"
                                            />
                                        )}
                                    </Stack>
                                </Paper>

                                {/* Section: Cấu trúc & Hiển thị */}
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        📊 Cấu trúc & Hiển thị
                                    </Typography>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
                                        {/* Parent Menu */}
                                        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '30%' } }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Menu cha (Parent Menu)</InputLabel>
                                                <Select
                                                    name="parent_id"
                                                    value={formData.parent_id || ''}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value || null }))}
                                                    label="Menu cha (Parent Menu)"
                                                >
                                                    <MenuItem value="">Không có (Top level)</MenuItem>
                                                    {items.filter(item => !item.parent_id && item.id !== editingId).map(item => (
                                                        <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>

                                        {/* Sort Order */}
                                        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '30%' } }}>
                                            <TextField
                                                fullWidth
                                                label="Thứ tự sắp xếp"
                                                name="sort_order"
                                                type="number"
                                                value={formData.sort_order || 0}
                                                onChange={handleInputChange}
                                                helperText="Số nhỏ hơn → hiển thị trước (10, 20, 30...)"
                                                InputProps={{
                                                    inputProps: { min: 0, step: 10 }
                                                }}
                                            />
                                        </Box>

                                        {/* Hiển thị */}
                                        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '30%' } }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Hiển thị</InputLabel>
                                                <Select
                                                    name="is_visible"
                                                    value={formData.is_visible ? 1 : 0}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, is_visible: e.target.value === 1 }))}
                                                    label="Hiển thị"
                                                >
                                                    <MenuItem value={1}>✓ Hiện</MenuItem>
                                                    <MenuItem value={0}>✕ Ẩn</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>

                                        {/* Mở tab mới */}
                                        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '30%' } }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Mở tab mới</InputLabel>
                                                <Select
                                                    name="open_in_new_tab"
                                                    value={formData.open_in_new_tab ? 1 : 0}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, open_in_new_tab: e.target.value === 1 }))}
                                                    label="Mở tab mới"
                                                >
                                                    <MenuItem value={0}>Không</MenuItem>
                                                    <MenuItem value={1}>Có</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>

                                        {/* Icon */}
                                        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '30%' } }}>
                                            <TextField
                                                fullWidth
                                                label="Icon (Optional)"
                                                name="icon"
                                                value={formData.icon || ''}
                                                onChange={handleInputChange}
                                                placeholder="🏠"
                                                helperText="Emoji"
                                            />
                                        </Box>
                                    </Stack>
                                </Paper>
                            </>
                        )}

                        {/* --- CONTACT REQUESTS FORM (View/Edit Only) --- */}
                        {activeTab === 'contacts' && (
                            <>
                                <Card sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Thông tin khách hàng</Typography>
                                        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} useFlexGap flexWrap="wrap">
                                            <Box sx={{ flex: 1, minWidth: '30%' }}>
                                                <Typography variant="caption" color="text.secondary">Danh xưng:</Typography>
                                                <Typography>{formData.salutation || '-'}</Typography>
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: '30%' }}>
                                                <Typography variant="caption" color="text.secondary">Số điện thoại:</Typography>
                                                <Typography>{formData.phone}</Typography>
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: '30%' }}>
                                                <Typography variant="caption" color="text.secondary">Email:</Typography>
                                                <Typography>{formData.email}</Typography>
                                            </Box>
                                            <Box sx={{ width: '100%' }}>
                                                <Typography variant="caption" color="text.secondary">Tiêu đề:</Typography>
                                                <Typography variant="h6">{formData.subject}</Typography>
                                            </Box>
                                            <Box sx={{ width: '100%' }}>
                                                <Typography variant="caption" color="text.secondary">Nội dung:</Typography>
                                                <Typography style={{ whiteSpace: 'pre-wrap' }}>{formData.message}</Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>

                                {formData.selected_gemstones && formData.selected_gemstones.length > 0 && (
                                    <Card sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" gutterBottom>Đá quý tham khảo:</Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                {formData.selected_gemstones.map((gem, idx) => (
                                                    <Chip key={idx} label={`${gem.title} - ${gem.price || 'N/A'}`} />
                                                ))}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                )}

                                {formData.selected_jewelry && formData.selected_jewelry.length > 0 && (
                                    <Card sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" gutterBottom>Trang sức tham khảo:</Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                {formData.selected_jewelry.map((jewel, idx) => (
                                                    <Chip key={idx} label={`${jewel.title} - ${jewel.price || 'N/A'}`} />
                                                ))}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                )}

                                <FormControl fullWidth>
                                    <InputLabel>Trạng thái</InputLabel>
                                    <Select
                                        name="status"
                                        value={formData.status || 'new'}
                                        onChange={handleInputChange}
                                        label="Trạng thái"
                                    >
                                        <MenuItem value="new">Mới</MenuItem>
                                        <MenuItem value="contacted">Đã liên hệ</MenuItem>
                                        <MenuItem value="completed">Hoàn thành</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Ghi chú của Admin"
                                    name="admin_notes"
                                    value={formData.admin_notes || ''}
                                    onChange={handleInputChange}
                                    placeholder="Thêm ghi chú nội bộ về yêu cầu này..."
                                />

                                <Typography variant="caption" color="text.secondary">
                                    Ngày gửi: {formData.created_at ? new Date(formData.created_at).toLocaleString('vi-VN') : '-'}
                                </Typography>
                            </>
                        )}

                        {/* --- GEMSTONE FORM --- */}
                        {activeTab === 'products' && (
                            <>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        📝 Thông tin cơ bản
                                    </Typography>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <Box sx={{ flex: 1 }}>
                                            <TextField fullWidth label="Tên đá quý" name="title" value={formData.title || ''} onChange={handleInputChange} required />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <FormControl fullWidth required>
                                                <InputLabel>Danh mục Đá Quý</InputLabel>
                                                <Select
                                                    name="gemstone_category_id"
                                                    value={formData.gemstone_category_id || ''}
                                                    onChange={handleInputChange}
                                                    label="Danh mục Đá Quý"
                                                >
                                                    <MenuItem value=""><em>Chọn</em></MenuItem>
                                                    {gemstoneCategories.map(c => (
                                                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <TextField fullWidth label="Giá" name="price" value={formData.price || ''} onChange={handleInputChange} />
                                        </Box>
                                    </Stack>
                                </Paper>

                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        🖼️ Hình ảnh
                                    </Typography>
                                    <Stack spacing={2}>
                                        <SingleImageUpload
                                            label="Ảnh Chính (Thumbnail)"
                                            value={formData.image}
                                            onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                        />
                                        <ImageUpload gallery={formData.gallery || []} setGallery={(newGal) => setFormData(prev => ({ ...prev, gallery: typeof newGal === 'function' ? newGal(prev.gallery) : newGal }))} />
                                    </Stack>
                                </Paper>

                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        📄 Mô tả chi tiết
                                    </Typography>
                                    <InputLabel shrink>Mô tả chi tiết (Rich Text + Ảnh)</InputLabel>
                                    <div style={{ border: '1px solid #ccc', marginTop: '8px' }}>
                                        <CKEditor
                                            editor={ClassicEditor}
                                            data={formData.description || ''}
                                            config={{
                                                extraPlugins: [MyCustomUploadAdapterPlugin]
                                            }}
                                            onChange={handleEditorChange('description')}
                                        />
                                    </div>
                                </Paper>

                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        🔬 Thông số kỹ thuật
                                    </Typography>
                                    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={2}>
                                        <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 11px)' } }}>
                                            <TextField fullWidth label="Trọng lượng (Carat)" name="weight" value={formData.weight || ''} onChange={handleInputChange} />
                                        </Box>
                                        <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 11px)' } }}>
                                            <TextField fullWidth label="Kích thước (Dimensions)" name="dimensions" value={formData.dimensions || ''} onChange={handleInputChange} />
                                        </Box>
                                        <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 11px)' } }}>
                                            <TextField fullWidth label="Màu sắc (Color)" name="color" value={formData.color || ''} onChange={handleInputChange} />
                                        </Box>
                                        <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 11px)' } }}>
                                            <TextField fullWidth label="Độ tinh khiết (Clarity)" name="clarity" value={formData.clarity || ''} onChange={handleInputChange} />
                                        </Box>
                                        <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 11px)' } }}>
                                            <TextField fullWidth label="Giác cắt (Cut)" name="cut" value={formData.cut || ''} onChange={handleInputChange} />
                                        </Box>
                                        <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 11px)' } }}>
                                            <TextField fullWidth label="Xuất xứ (Origin)" name="origin" value={formData.origin || ''} onChange={handleInputChange} />
                                        </Box>
                                    </Stack>
                                </Paper>
                            </>
                        )}

                        {/* --- JEWELRY FORM --- */}
                        {activeTab === 'jewelry' && (
                            <>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        📝 Thông tin cơ bản
                                    </Typography>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <Box sx={{ flex: 1 }}>
                                            <TextField fullWidth label="Tên trang sức" name="title" value={formData.title || ''} onChange={handleInputChange} required />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <FormControl fullWidth required>
                                                <InputLabel>Loại Trang Sức</InputLabel>
                                                <Select
                                                    name="jewelry_category_id"
                                                    value={formData.jewelry_category_id || ''}
                                                    onChange={handleInputChange}
                                                    label="Loại Trang Sức"
                                                >
                                                    {jewelryCategories.map(c => (
                                                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <TextField fullWidth label="Giá" name="price" value={formData.price || ''} onChange={handleInputChange} />
                                        </Box>
                                    </Stack>
                                </Paper>

                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        💎 Thành phần đá quý
                                    </Typography>
                                    <FormControl fullWidth>
                                        <InputLabel>Thành phần Đá Quý</InputLabel>
                                        <Select
                                            multiple
                                            name="gemstone_category_ids"
                                            value={formData.gemstone_category_ids || []}
                                            onChange={handleInputChange}
                                            input={<OutlinedInput label="Thành phần Đá Quý" />}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((value) => {
                                                        const cat = gemstoneCategories.find(c => c.id === value);
                                                        return <Chip key={value} label={cat ? cat.name : value} />;
                                                    })}
                                                </Box>
                                            )}
                                        >
                                            {gemstoneCategories.map((c) => (
                                                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Paper>

                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        🖼️ Hình ảnh
                                    </Typography>
                                    <Stack spacing={2}>
                                        <SingleImageUpload
                                            label="Ảnh Chính (Thumbnail)"
                                            value={formData.image}
                                            onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                        />
                                        <ImageUpload gallery={formData.gallery || []} setGallery={(newGal) => setFormData(prev => ({ ...prev, gallery: typeof newGal === 'function' ? newGal(prev.gallery) : newGal }))} />
                                    </Stack>
                                </Paper>

                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 3, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                                        📄 Mô tả chi tiết
                                    </Typography>
                                    <InputLabel shrink>Mô tả chi tiết (Rich Text + Ảnh)</InputLabel>
                                    <div style={{ border: '1px solid #ccc', marginTop: '8px' }}>
                                        <CKEditor
                                            editor={ClassicEditor}
                                            data={formData.description || ''}
                                            config={{
                                                extraPlugins: [MyCustomUploadAdapterPlugin]
                                            }}
                                            onChange={handleEditorChange}
                                        />
                                    </div>
                                </Paper>
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">
                        {activeTab === 'contacts' ? 'Đóng' : 'Hủy'}
                    </Button>
                    {activeTab !== 'contacts' && (
                        <Button onClick={handleSubmit} variant="contained" color="primary">
                            {editingId ? 'Cập nhật' : 'Lưu'}
                        </Button>
                    )}
                    {activeTab === 'contacts' && editingId && (
                        <Button onClick={handleSubmit} variant="contained" color="primary">
                            Cập nhật trạng thái
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const SectionConfigDialog = ({ open, onClose, settings, onSave, onChange }) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Cấu hình Section "Đá Quý"</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <TextField
                        label="Tiêu đề Section"
                        name="GEM_SECTION_TITLE"
                        value={settings.GEM_SECTION_TITLE || ''}
                        onChange={onChange}
                        fullWidth
                    />
                    <TextField
                        label="Mô tả Section"
                        name="GEM_SECTION_DESC"
                        value={settings.GEM_SECTION_DESC || ''}
                        onChange={onChange}
                        fullWidth
                        multiline
                        rows={3}
                    />
                    <SingleImageUpload
                        label="Ảnh nền Section (Background)"
                        value={settings.GEM_SECTION_BG}
                        onChange={(url) => onChange({ target: { name: 'GEM_SECTION_BG', value: url } })}
                    />
                    <TextField
                        label="Số cột hiển thị"
                        name="GEM_GRID_COLUMNS"
                        value={settings.GEM_GRID_COLUMNS || '4'}
                        onChange={onChange}
                        fullWidth
                        type="number"
                        inputProps={{ min: 1, max: 6, step: 1 }}
                        helperText="Số cột hiển thị đá quý trên website (1-6, mặc định: 4)"
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Hủy</Button>
                <Button onClick={onSave} variant="contained" color="primary">Lưu thay đổi</Button>
            </DialogActions>
        </Dialog>
    );
};

const JewelrySectionConfigDialog = ({ open, onClose, settings, onSave, onChange }) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Cấu hình Section "Trang Sức"</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <TextField
                        label="Tiêu đề Section"
                        name="JEWELRY_SECTION_TITLE"
                        value={settings.JEWELRY_SECTION_TITLE || ''}
                        onChange={onChange}
                        fullWidth
                    />
                    <TextField
                        label="Mô tả Section"
                        name="JEWELRY_SECTION_DESC"
                        value={settings.JEWELRY_SECTION_DESC || ''}
                        onChange={onChange}
                        fullWidth
                        multiline
                        rows={3}
                    />
                    <SingleImageUpload
                        label="Ảnh nền Section (Background)"
                        value={settings.JEWELRY_SECTION_BG}
                        onChange={(url) => onChange({ target: { name: 'JEWELRY_SECTION_BG', value: url } })}
                    />
                    <TextField
                        label="Số cột hiển thị"
                        name="JEWELRY_GRID_COLUMNS"
                        value={settings.JEWELRY_GRID_COLUMNS || '4'}
                        onChange={onChange}
                        fullWidth
                        type="number"
                        inputProps={{ min: 1, max: 6, step: 1 }}
                        helperText="Số cột hiển thị trang sức trên website (1-6, mặc định: 4)"
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Hủy</Button>
                <Button onClick={onSave} variant="contained" color="primary">Lưu thay đổi</Button>
            </DialogActions>
        </Dialog>
    );
};

const CollectionSectionConfigDialog = ({ open, onClose, settings, onSave, onChange }) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Cấu hình Section "Bộ Sưu Tập"</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <TextField
                        label="Tiêu đề Section"
                        name="COLLECTION_SECTION_TITLE"
                        value={settings.COLLECTION_SECTION_TITLE || ''}
                        onChange={onChange}
                        fullWidth
                    />
                    <TextField
                        label="Mô tả Section"
                        name="COLLECTION_SECTION_DESC"
                        value={settings.COLLECTION_SECTION_DESC || ''}
                        onChange={onChange}
                        fullWidth
                        multiline
                        rows={3}
                    />
                    <SingleImageUpload
                        label="Ảnh nền Section (Background)"
                        value={settings.COLLECTION_SECTION_BG}
                        onChange={(url) => onChange({ target: { name: 'COLLECTION_SECTION_BG', value: url } })}
                    />
                    <TextField
                        label="Số cột hiển thị"
                        name="COLLECTION_GRID_COLUMNS"
                        value={settings.COLLECTION_GRID_COLUMNS || '4'}
                        onChange={onChange}
                        fullWidth
                        type="number"
                        inputProps={{ min: 1, max: 6, step: 1 }}
                        helperText="Số cột hiển thị bộ sưu tập trên website (1-6, mặc định: 4)"
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Hủy</Button>
                <Button onClick={onSave} variant="contained" color="primary">Lưu thay đổi</Button>
            </DialogActions>
        </Dialog>
    );
};

const ContactFormConfigDialog = ({ open, onClose, config, onSave }) => {
    const [localConfig, setLocalConfig] = useState(config || {});

    useEffect(() => {
        if (open) {
            setLocalConfig(config || {});
        }
    }, [open, config]);

    const handleChange = (field, key, value) => {
        setLocalConfig(prev => ({
            ...prev,
            [field]: { ...prev[field], [key]: value }
        }));
    };

    const handleSave = () => {
        onSave(localConfig);
    };

    const fields = [
        { id: 'salutation', label: 'Danh xưng' },
        { id: 'phone', label: 'Số điện thoại' },
        { id: 'email', label: 'Email' },
        { id: 'subject', label: 'Tiêu đề' },
        { id: 'message', label: 'Nội dung tin nhắn' }
    ];

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Cấu hình trường nhập liệu Form Liên hệ</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                        Tùy chỉnh tiêu đề trang, nhãn (Label), gợi ý (Placeholder) và bắt buộc nhập (Required) cho từng trường.
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <TextField
                            label="Tiêu đề Trang Contact"
                            value={localConfig.title || ''}
                            onChange={(e) => setLocalConfig(prev => ({ ...prev, title: e.target.value }))}
                            fullWidth
                            placeholder="LET US CREATE THE PERFECT CUSTOM JEWELRY PIECE FOR YOU"
                        />
                    </Paper>
                    {fields.map(field => (
                        <Paper key={field.id} variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                {field.label}
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                <TextField
                                    label="Nhãn (Label)"
                                    value={localConfig[field.id]?.label || ''}
                                    onChange={(e) => handleChange(field.id, 'label', e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    label="Gợi ý (Placeholder)"
                                    value={localConfig[field.id]?.placeholder || ''}
                                    onChange={(e) => handleChange(field.id, 'placeholder', e.target.value)}
                                    fullWidth
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!localConfig[field.id]?.required}
                                            onChange={(e) => handleChange(field.id, 'required', e.target.checked)}
                                        />
                                    }
                                    label="Bắt buộc"
                                    sx={{ minWidth: 120 }}
                                />
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Hủy</Button>
                <Button onClick={handleSave} variant="contained" color="primary">Lưu cấu hình</Button>
            </DialogActions>
        </Dialog>
    );
};

const HeroConfigDialog = ({ open, onClose, settings, onSave, onChange, setSettings }) => {
    const [uploadedFonts, setUploadedFonts] = useState([]);

    useEffect(() => {
        if (open) {
            fetch(`${API_URL}/api/fonts`, { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    setUploadedFonts(data);
                    data.forEach(font => {
                        const styleId = `font-style-${font.id}`;
                        if (!document.getElementById(styleId)) {
                            const style = document.createElement('style');
                            style.id = styleId;
                            style.textContent = `
                                @font-face {
                                    font-family: '${font.name}';
                                    src: url('${font.url}');
                                }
                            `;
                            document.head.appendChild(style);
                        }
                    });
                })
                .catch(console.error);
        }
    }, [open]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Cấu hình Font (Hero)</DialogTitle>
            <DialogContent>
                <Stack spacing={4} sx={{ mt: 1 }}>
                    {/* --- SECTION: TIÊU ĐỀ --- */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>TIÊU ĐỀ (Title)</span>
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel>Nguồn Font Tiêu đề</InputLabel>
                                <Select
                                    name="HERO_TITLE_FONT_SOURCE"
                                    value={settings.HERO_TITLE_FONT_SOURCE || 'system'}
                                    onChange={onChange}
                                    label="Nguồn Font Tiêu đề"
                                >
                                    <MenuItem value="system">System Default</MenuItem>
                                    <MenuItem value="custom">Custom Font (Upload)</MenuItem>
                                </Select>
                            </FormControl>
                            {settings.HERO_TITLE_FONT_SOURCE === 'custom' && (
                                <FormControl fullWidth>
                                    <InputLabel>Chọn Custom Font (Tiêu đề)</InputLabel>
                                    <Select
                                        name="HERO_TITLE_FONT"
                                        value={settings.HERO_TITLE_FONT || ''}
                                        onChange={(e) => {
                                            const fontName = e.target.value;
                                            const selectedFont = uploadedFonts.find(f => f.name === fontName);
                                            if (selectedFont) {
                                                setSettings(prev => ({
                                                    ...prev,
                                                    HERO_TITLE_FONT: fontName,
                                                    HERO_TITLE_CUSTOM_FONT_URL: selectedFont.url
                                                }));
                                            }
                                        }}
                                        label="Chọn Custom Font (Tiêu đề)"
                                    >
                                        {uploadedFonts.map(font => (
                                            <MenuItem key={font.id} value={font.name} sx={{ fontFamily: font.name }}>
                                                {font.name} (Preview)
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                        Preview: <span style={{ fontFamily: settings.HERO_TITLE_FONT, fontSize: '1.2rem' }}>Hero Title Text</span>
                                    </Typography>
                                </FormControl>
                            )}
                        </Stack>
                    </Box>

                    {/* --- SECTION: PHỤ ĐỀ --- */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>PHỤ ĐỀ (Subtitle)</span>
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel>Nguồn Font Phụ đề</InputLabel>
                                <Select
                                    name="HERO_SUBTITLE_FONT_SOURCE"
                                    value={settings.HERO_SUBTITLE_FONT_SOURCE || 'system'}
                                    onChange={onChange}
                                    label="Nguồn Font Phụ đề"
                                >
                                    <MenuItem value="system">System Default</MenuItem>
                                    <MenuItem value="custom">Custom Font (Upload)</MenuItem>
                                </Select>
                            </FormControl>
                            {settings.HERO_SUBTITLE_FONT_SOURCE === 'custom' && (
                                <FormControl fullWidth>
                                    <InputLabel>Chọn Custom Font (Phụ đề)</InputLabel>
                                    <Select
                                        name="HERO_SUBTITLE_FONT"
                                        value={settings.HERO_SUBTITLE_FONT || ''}
                                        onChange={(e) => {
                                            const fontName = e.target.value;
                                            const selectedFont = uploadedFonts.find(f => f.name === fontName);
                                            if (selectedFont) {
                                                setSettings(prev => ({
                                                    ...prev,
                                                    HERO_SUBTITLE_FONT: fontName,
                                                    HERO_SUBTITLE_CUSTOM_FONT_URL: selectedFont.url
                                                }));
                                            }
                                        }}
                                        label="Chọn Custom Font (Phụ đề)"
                                    >
                                        {uploadedFonts.map(font => (
                                            <MenuItem key={font.id} value={font.name} sx={{ fontFamily: font.name }}>
                                                {font.name} (Preview)
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                        Preview: <span style={{ fontFamily: settings.HERO_SUBTITLE_FONT, fontSize: '1.2rem' }}>Subtitle Text</span>
                                    </Typography>
                                </FormControl>
                            )}
                        </Stack>
                    </Box>

                    {/* --- SECTION: NÚT BẤM --- */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>NÚT BẤM (Button)</span>
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel>Nguồn Font Nút bấm</InputLabel>
                                <Select
                                    name="HERO_BUTTON_FONT_SOURCE"
                                    value={settings.HERO_BUTTON_FONT_SOURCE || 'system'}
                                    onChange={onChange}
                                    label="Nguồn Font Nút bấm"
                                >
                                    <MenuItem value="system">System Default</MenuItem>
                                    <MenuItem value="custom">Custom Font (Upload)</MenuItem>
                                </Select>
                            </FormControl>
                            {settings.HERO_BUTTON_FONT_SOURCE === 'custom' && (
                                <FormControl fullWidth>
                                    <InputLabel>Chọn Custom Font (Nút bấm)</InputLabel>
                                    <Select
                                        name="HERO_BUTTON_FONT"
                                        value={settings.HERO_BUTTON_FONT || ''}
                                        onChange={(e) => {
                                            const fontName = e.target.value;
                                            const selectedFont = uploadedFonts.find(f => f.name === fontName);
                                            if (selectedFont) {
                                                setSettings(prev => ({
                                                    ...prev,
                                                    HERO_BUTTON_FONT: fontName,
                                                    HERO_BUTTON_CUSTOM_FONT_URL: selectedFont.url
                                                }));
                                            }
                                        }}
                                        label="Chọn Custom Font (Nút bấm)"
                                    >
                                        {uploadedFonts.map(font => (
                                            <MenuItem key={font.id} value={font.name} sx={{ fontFamily: font.name }}>
                                                {font.name} (Preview)
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                        Preview: <span style={{ fontFamily: settings.HERO_BUTTON_FONT, fontSize: '1.2rem', fontWeight: 'bold' }}>BUTTON TEXT</span>
                                    </Typography>
                                </FormControl>
                            )}
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button variant="contained" onClick={onSave}>Lưu Cấu hình</Button>
            </DialogActions>
        </Dialog>
    );
};

const MenuConfigDialog = ({ open, onClose, settings, onSave, onChange, setSettings }) => {
    const [uploadedFonts, setUploadedFonts] = useState([]);

    useEffect(() => {
        if (open) {
            fetch(`${API_URL}/api/fonts`, { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    setUploadedFonts(data);
                    data.forEach(font => {
                        const styleId = `font-style-${font.id}`;
                        if (!document.getElementById(styleId)) {
                            const style = document.createElement('style');
                            style.id = styleId;
                            style.textContent = `
                                @font-face {
                                    font-family: '${font.name}';
                                    src: url('${font.url}');
                                }
                            `;
                            document.head.appendChild(style);
                        }
                    });
                })
                .catch(console.error);
        }
    }, [open]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Cấu hình Font (Menu/Navbar)</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>Nguồn Font</InputLabel>
                        <Select
                            name="NAVBAR_FONT_SOURCE"
                            value={settings.NAVBAR_FONT_SOURCE || 'system'}
                            onChange={onChange}
                            label="Nguồn Font"
                        >
                            <MenuItem value="system">System Default</MenuItem>
                            <MenuItem value="custom">Custom Font (Upload)</MenuItem>
                        </Select>
                    </FormControl>

                    {settings.NAVBAR_FONT_SOURCE === 'custom' && (
                        <>
                            <FormControl fullWidth>
                                <InputLabel>Chọn Custom Font</InputLabel>
                                <Select
                                    name="NAVBAR_FONT"
                                    value={settings.NAVBAR_FONT || ''}
                                    onChange={(e) => {
                                        const fontName = e.target.value;
                                        const selectedFont = uploadedFonts.find(f => f.name === fontName);
                                        if (selectedFont) {
                                            setSettings(prev => ({
                                                ...prev,
                                                NAVBAR_FONT: fontName,
                                                NAVBAR_CUSTOM_FONT_URL: selectedFont.url
                                            }));
                                        }
                                    }}
                                    label="Chọn Custom Font"
                                >
                                    {uploadedFonts.map(font => (
                                        <MenuItem key={font.id} value={font.name} sx={{ fontFamily: font.name }}>
                                            {font.name} (Preview)
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Box sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #ddd' }}>
                                <Typography
                                    variant="h6"
                                    sx={{ fontFamily: settings.NAVBAR_FONT || 'Arial, sans-serif' }}
                                >
                                    Preview: This is how your navbar font looks
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontFamily: settings.NAVBAR_FONT || 'Arial, sans-serif', mt: 1 }}
                                >
                                    HOME • PAGES • COLLECTIONS • NEWS
                                </Typography>
                            </Box>
                        </>
                    )}

                    {settings.NAVBAR_FONT_SOURCE === 'system' && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Sử dụng font mặc định: PT Sans Narrow (hoặc Arial Narrow fallback)
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button variant="contained" onClick={onSave}>Lưu Cấu hình</Button>
            </DialogActions>
        </Dialog>
    );
};

const GlobalConfigDialog = ({ open, onClose, settings, onSave, onChange, setSettings }) => {
    const [uploadedFonts, setUploadedFonts] = useState([]);

    useEffect(() => {
        if (open) {
            fetch(`${API_URL}/api/fonts`, { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    setUploadedFonts(data);
                    data.forEach(font => {
                        const styleId = `font-style-${font.id}`;
                        if (!document.getElementById(styleId)) {
                            const style = document.createElement('style');
                            style.id = styleId;
                            style.textContent = `
                                @font-face {
                                    font-family: '${font.name}';
                                    src: url('${font.url}');
                                }
                            `;
                            document.head.appendChild(style);
                        }
                    });
                })
                .catch(console.error);
        }
    }, [open]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Cấu hình Font (Hệ thống - Ngoài Hero/Menu)</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>Nguồn Font Hệ thống</InputLabel>
                        <Select
                            name="GLOBAL_FONT_SOURCE"
                            value={settings.GLOBAL_FONT_SOURCE || 'system'}
                            onChange={onChange}
                            label="Nguồn Font Hệ thống"
                        >
                            <MenuItem value="system">System Default</MenuItem>
                            <MenuItem value="custom">Custom Font (Upload)</MenuItem>
                        </Select>
                    </FormControl>

                    {settings.GLOBAL_FONT_SOURCE === 'custom' && (
                        <>
                            <FormControl fullWidth>
                                <InputLabel>Chọn Custom Font</InputLabel>
                                <Select
                                    name="GLOBAL_FONT"
                                    value={settings.GLOBAL_FONT || ''}
                                    onChange={(e) => {
                                        const fontName = e.target.value;
                                        const selectedFont = uploadedFonts.find(f => f.name === fontName);
                                        if (selectedFont) {
                                            setSettings(prev => ({
                                                ...prev,
                                                GLOBAL_FONT: fontName,
                                                GLOBAL_CUSTOM_FONT_URL: selectedFont.url
                                            }));
                                        }
                                    }}
                                    label="Chọn Custom Font"
                                >
                                    {uploadedFonts.map(font => (
                                        <MenuItem key={font.id} value={font.name} sx={{ fontFamily: font.name }}>
                                            {font.name} (Preview)
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Box sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #ddd' }}>
                                <Typography
                                    variant="h6"
                                    sx={{ fontFamily: settings.GLOBAL_FONT || 'Arial, sans-serif' }}
                                >
                                    Preview: Text sample using this font
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontFamily: settings.GLOBAL_FONT || 'Arial, sans-serif', mt: 1 }}
                                >
                                    The quick brown fox jumps over the lazy dog. 1234567890.
                                </Typography>
                            </Box>
                        </>
                    )}

                    {settings.GLOBAL_FONT_SOURCE === 'system' && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Sử dụng font mặc định: PT Sans Narrow (hoặc Arial Narrow fallback)
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button variant="contained" onClick={onSave}>Lưu Cấu hình</Button>
            </DialogActions>
        </Dialog>
    );
};

const FontManager = () => {
    const [fonts, setFonts] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [name, setName] = useState('');

    const fetchFonts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/fonts`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setFonts(data);

                // Inject font styles for preview
                data.forEach(font => {
                    const styleId = `font-style-${font.id}`;
                    if (!document.getElementById(styleId)) {
                        const style = document.createElement('style');
                        style.id = styleId;
                        style.textContent = `
                            @font-face {
                                font-family: '${font.name}';
                                src: url('${font.url}');
                            }
                        `;
                        document.head.appendChild(style);
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching fonts:', error);
            toast.error('Failed to load fonts');
        }
    };

    useEffect(() => {
        fetchFonts();
    }, []);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!name) {
            toast.error('Please enter a font name first');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);

        setUploading(true);
        try {
            const res = await fetch(`${API_URL}/api/fonts`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (res.ok) {
                toast.success('Font uploaded successfully');
                setName('');
                fetchFonts();
            } else {
                toast.error('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload error');
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this font?')) return;

        try {
            const res = await fetch(`${API_URL}/api/fonts/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                toast.success('Font deleted');
                fetchFonts();
            } else {
                toast.error('Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Delete error');
        }
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Typography variant="h6" gutterBottom>Quản lý Font</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Upload các file font (.ttf, .woff, .woff2) để sử dụng cho Website.
            </Typography>

            <Box sx={{ mb: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                        label="Tên Font (VD: MyCustomFont)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        size="small"
                        sx={{ minWidth: 200 }}
                    />
                    <Button
                        component="label"
                        variant="contained"
                        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : 'Upload Font'}
                        <input type="file" hidden accept=".ttf,.woff,.woff2,.otf" onChange={handleUpload} />
                    </Button>
                </Stack>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tên Font</TableCell>
                            <TableCell>Preview</TableCell>
                            <TableCell>File</TableCell>
                            <TableCell align="right">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fonts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">Chưa có font nào được upload</TableCell>
                            </TableRow>
                        ) : (
                            fonts.map((font) => (
                                <TableRow key={font.id}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{font.name}</TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontFamily: font.name, fontSize: '1.2rem' }}>
                                            The quick brown fox jumps over the lazy dog
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={font.url} target="_blank" rel="noopener noreferrer" underline="hover">
                                            Download
                                        </Link>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton color="error" onClick={() => handleDelete(font.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default AdminApp;
