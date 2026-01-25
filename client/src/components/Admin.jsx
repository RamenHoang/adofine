import React, { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText,
    CssBaseline, Box, IconButton, Card, CardContent, Grid, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
    Select, InputLabel, FormControl, Chip, OutlinedInput, Stack, LinearProgress, InputAdornment
} from '@mui/material';
import {
    Menu as MenuIcon, Dashboard, ShoppingBag, People, Receipt,
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    ShoppingCart as CartIcon, Inventory as ProductIcon, PersonAdd,
    Category as CategoryIcon, Diamond as GemIcon, Watch as JewelryIcon,
    Settings as SettingsIcon, CloudUpload as UploadIcon,
    ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon, Close as CloseIcon,
    ViewCarousel as CarouselIcon, Book as BookIcon, Collections as CollectionIcon
} from '@mui/icons-material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { API_URL } from '../config';

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
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                alert('Upload failed: ' + (err.error || 'Unknown error'));
            } else {
                const data = await res.json();
                onChange(data.url); // Pass back the URL
            }
        } catch (error) {
            console.error('Upload error', error);
            alert('Upload Error');
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
                    body: formData
                });

                if (!res.ok) {
                    const err = await res.json();
                    alert('Upload failed: ' + (err.error || 'Unknown error'));
                    continue;
                }

                const data = await res.json();
                newImages.push({ url: data.url, public_id: data.public_id });
            }
            setGallery(prev => [...prev, ...newImages]);
        } catch (error) {
            console.error('Upload error', error);
            alert('Upload Error');
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


const Admin = () => {
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
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});

    // Settings State
    const [settings, setSettings] = useState({ CLOUD_NAME: '', API_KEY: '', API_SECRET: '', UPLOAD_PRESET: '' });

    useEffect(() => {
        loadDataForTab();
        fetchDropdowns();
    }, [activeTab]);

    const fetchDropdowns = async () => {
        try {
            const [gemCats, jewCats] = await Promise.all([
                fetch(`${API_URL}/api/gemstone-categories`).then(res => res.json()),
                fetch(`${API_URL}/api/jewelry-categories`).then(res => res.json())
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
            case 'blogs': endpoint = '/api/posts'; break;
            case 'collections': endpoint = '/api/collections'; break;
            default: return;
        }

        try {
            const res = await fetch(`${API_URL}${endpoint}`);
            const data = await res.json();
            setItems(data);
            if (activeTab === 'products' || activeTab === 'jewelry') {
                setStats(prev => ({ ...prev, products: data.length }));
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const loadSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/api/settings`);
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) alert('Đã lưu cấu hình!');
            else alert('Lỗi khi lưu cấu hình');
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const handleOpenDialog = async (item = null) => {
        setEditingId(item ? item.id : null);

        let fullItem = item;
        if (item && (activeTab === 'products' || activeTab === 'jewelry' || activeTab === 'collections')) {
            try {
                const endpoint = activeTab === 'products' ? `/api/gemstones/${item.id}` :
                    activeTab === 'jewelry' ? `/api/jewelry-items/${item.id}` :
                        `/api/collections/${item.id}`;
                const res = await fetch(`${API_URL}${endpoint}`);
                if (res.ok) fullItem = await res.json();
            } catch (err) { console.error(err); }
        }

        // Load all products for selector if collections
        if (activeTab === 'collections') {
            try {
                const [gems, jews] = await Promise.all([
                    fetch(`${API_URL}/api/gemstones`).then(r => r.json()),
                    fetch(`${API_URL}/api/jewelry-items`).then(r => r.json())
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
        else if (activeTab === 'blogs') endpoint = '/api/posts';
        else if (activeTab === 'collections') endpoint = '/api/collections';

        const url = editingId ? `${API_URL}${endpoint}/${editingId}` : `${API_URL}${endpoint}`;
        const method = editingId ? 'PUT' : 'POST';

        const payload = { ...formData };
        if ((activeTab === 'products' || activeTab === 'jewelry') && !payload.image && payload.gallery && payload.gallery.length > 0) {
            // Optional: still fallback to gallery[0] if no main image
        }

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                loadDataForTab();
                handleCloseDialog();
                alert(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
            } else {
                alert('Có lỗi xảy ra!');
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

        try {
            await fetch(`${API_URL}${endpoint}/${id}`, { method: 'DELETE' });
            loadDataForTab();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const drawer = (
        <div>
            <Toolbar sx={{ backgroundColor: '#1e1e1e', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', pt: 2, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>GEM ADMIN</Typography>
                <Typography variant="caption" sx={{ color: '#aaa' }}>v2.5 Dynamic Hero</Typography>
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
                <ListItem button selected={activeTab === 'hero-slides'} onClick={() => setActiveTab('hero-slides')}>
                    <ListItemIcon><CarouselIcon /></ListItemIcon>
                    <ListItemText primary="Quản lý Hero Slide" />
                </ListItem>
                <ListItem button selected={activeTab === 'blogs'} onClick={() => setActiveTab('blogs')}>
                    <ListItemIcon><BookIcon /></ListItemIcon>
                    <ListItemText primary="Quản lý Tin tức" />
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
                                            activeTab === 'blogs' ? 'Quản lý Tin tức' :
                                                activeTab === 'collections' ? 'Quản lý Bộ sưu tập' :
                                                    activeTab === 'gem-categories' ? 'Danh mục Đá Quý' : 'Danh mục Trang Sức'}
                    </Typography>
                    <Button color="inherit">Đăng xuất</Button>
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

                {activeTab === 'settings' && (
                    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
                        <Typography variant="h6" gutterBottom>Cấu hình Logo & Thương hiệu</Typography>
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
                        <Stack spacing={3}>
                            <TextField label="Cloud Name" name="CLOUD_NAME" value={settings.CLOUD_NAME} onChange={handleSettingsChange} fullWidth />
                            <TextField label="API Key" name="API_KEY" value={settings.API_KEY} onChange={handleSettingsChange} fullWidth />
                            <TextField label="API Secret" name="API_SECRET" value={settings.API_SECRET} onChange={handleSettingsChange} fullWidth type="password" />
                            <TextField label="Upload Preset" name="UPLOAD_PRESET" value={settings.UPLOAD_PRESET} onChange={handleSettingsChange} fullWidth helperText="Tạo preset 'unsigned' trong Cloudinary Settings > Upload" />

                            <Button variant="contained" onClick={saveSettings} size="large">Lưu Cấu hình</Button>
                        </Stack>
                    </Paper>
                )}

                {activeTab !== 'dashboard' && activeTab !== 'settings' && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            {activeTab === 'products' ? (
                                <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => setOpenSectionConfigDialog(true)}>
                                    Cấu hình Section
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

            {/* SHARED DIALOG FORM */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
                <DialogTitle>
                    {editingId ? 'Chỉnh sửa' : 'Thêm mới'}
                    {activeTab === 'products' ? ' Đá Quý' : activeTab === 'jewelry' ? ' Trang Sức' : activeTab === 'hero-slides' ? ' Hero Slide' : activeTab === 'blogs' ? ' Tin tức' : activeTab === 'collections' ? ' Bộ sưu tập' : ' Danh mục'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {/* --- CATEGORY FORM --- */}
                        {(activeTab === 'gem-categories' || activeTab === 'jewelry-categories') && (
                            <>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Tên danh mục" name="name" value={formData.name || ''} onChange={handleInputChange} required />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth multiline rows={3} label="Mô tả" name="description" value={formData.description || ''} onChange={handleInputChange} />
                                </Grid>
                            </>
                        )}

                        {/* --- HERO SLIDE FORM --- */}
                        {activeTab === 'hero-slides' && (
                            <>
                                <Grid item xs={12}>
                                    <SingleImageUpload
                                        label="Ảnh nền (Background Image)"
                                        value={formData.image_url}
                                        onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Tiêu đề chính" name="title" value={formData.title || ''} onChange={handleInputChange} placeholder="Ví dụ: Tinh hoa & SANG TRỌNG" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Thứ tự hiển thị" name="sort_order" type="number" value={formData.sort_order || 0} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Phụ đề (Subtitle)" name="subtitle" value={formData.subtitle || ''} onChange={handleInputChange} placeholder="Ví dụ: CHÀO MỪNG BẠN..." />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Link liên kết (Optional)" name="link" value={formData.link || ''} onChange={handleInputChange} placeholder="/portfolio/1" />
                                </Grid>
                            </>
                        )}

                        {/* --- COLLECTION FORM --- */}
                        {activeTab === 'collections' && (
                            <>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Tên Bộ Sưu Tập" name="title" value={formData.title || ''} onChange={handleInputChange} required />
                                </Grid>
                                <Grid item xs={12}>
                                    <SingleImageUpload
                                        label="Ảnh Đại Diện (Main Image)"
                                        value={formData.image}
                                        onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth multiline rows={3} label="Mô tả ngắn" name="description" value={formData.description || ''} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12}>
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
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Sản phẩm trong Bộ Sưu Tập</Typography>

                                    {/* Selector */}
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
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
                                    </Box>

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
                                </Grid>
                            </>
                        )}

                        {/* --- BLOG FORM --- */}
                        {activeTab === 'blogs' && (
                            <>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Tiêu đề bài viết" name="title" value={formData.title || ''} onChange={handleInputChange} required />
                                </Grid>
                                {/* Removed Author Input */}
                                <Grid item xs={12}>
                                    <SingleImageUpload
                                        label="Ảnh bài viết (Thumbnail)"
                                        value={formData.image_url}
                                        onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth multiline rows={3} label="Tóm tắt (Excerpt)" name="excerpt" value={formData.excerpt || ''} onChange={handleInputChange} />
                                </Grid>
                                <Grid item xs={12}>
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
                                </Grid>
                            </>
                        )}

                        {/* --- GEMSTONE FORM --- */}
                        {activeTab === 'products' && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Tên đá quý" name="title" value={formData.title || ''} onChange={handleInputChange} required />
                                </Grid>
                                <Grid item xs={12} sm={6}>
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
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Giá" name="price" value={formData.price || ''} onChange={handleInputChange} />
                                </Grid>

                                {/* Image Upload (Single + Gallery) */}
                                <Grid item xs={12}>
                                    {/* Main Image Upload */}
                                    <SingleImageUpload
                                        label="Ảnh Chính (Thumbnail)"
                                        value={formData.image}
                                        onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    {/* Gallery Upload */}
                                    <ImageUpload gallery={formData.gallery || []} setGallery={(newGal) => setFormData(prev => ({ ...prev, gallery: typeof newGal === 'function' ? newGal(prev.gallery) : newGal }))} />
                                </Grid>

                                <Grid item xs={12}>
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
                                </Grid>
                                {/* Technical Specs */}
                                <Grid item xs={12}><Typography variant="subtitle2" sx={{ mt: 2 }}>Thông số kỹ thuật</Typography></Grid>
                                <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Trọng lượng (Carat)" name="weight" value={formData.weight || ''} onChange={handleInputChange} /></Grid>
                                <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Kích thước (Dimensions)" name="dimensions" value={formData.dimensions || ''} onChange={handleInputChange} /></Grid>
                                <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Màu sắc (Color)" name="color" value={formData.color || ''} onChange={handleInputChange} /></Grid>
                                <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Độ tinh khiết (Clarity)" name="clarity" value={formData.clarity || ''} onChange={handleInputChange} /></Grid>
                                <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Giác cắt (Cut)" name="cut" value={formData.cut || ''} onChange={handleInputChange} /></Grid>
                                <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Xuất xứ (Origin)" name="origin" value={formData.origin || ''} onChange={handleInputChange} /></Grid>
                            </>
                        )}

                        {/* --- JEWELRY FORM --- */}
                        {activeTab === 'jewelry' && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Tên trang sức" name="title" value={formData.title || ''} onChange={handleInputChange} required />
                                </Grid>
                                <Grid item xs={12} sm={6}>
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
                                </Grid>
                                <Grid item xs={12} sm={6}>
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
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Giá" name="price" value={formData.price || ''} onChange={handleInputChange} />
                                </Grid>

                                <Grid item xs={12}>
                                    {/* Main Image Upload */}
                                    <SingleImageUpload
                                        label="Ảnh Chính (Thumbnail)"
                                        value={formData.image}
                                        onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <ImageUpload gallery={formData.gallery || []} setGallery={(newGal) => setFormData(prev => ({ ...prev, gallery: typeof newGal === 'function' ? newGal(prev.gallery) : newGal }))} />
                                </Grid>

                                <Grid item xs={12}>
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
                                </Grid>
                            </>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">{editingId ? 'Cập nhật' : 'Lưu'}</Button>
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
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Hủy</Button>
                <Button onClick={onSave} variant="contained" color="primary">Lưu thay đổi</Button>
            </DialogActions>
        </Dialog>
    );
};

export default Admin;
