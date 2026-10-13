const express = require('express');
const js2xmlparser = require('js2xmlparser'); // For XML content negotiation
const app = express();

app.use(express.json());

// B1: Problem Details Helper
function problem(res, status, type, title, detail, extras = {}) {
    res.status(status).set('Content-Type', 'application/problem+json; charset=utf-8');
    res.json({
        type: `https://api.CampusEats.com/errors/${type}`,
        title,
        status,
        detail,
        ...extras
    });
}

// C2 & B3: Validate then act (Field-level validation)
function validateSubmission(req, res, next) {
    const errors = [];
    const { platform, code, language } = req.body;

    if (!platform || !['leetcode', 'codeforces', 'hackerrank'].includes(platform)) {
        errors.push({ field: 'platform', reason: 'Must be a supported platform (leetcode, codeforces, hackerrank)' });
    }
    if (!code || typeof code !== 'string') {
        errors.push({ field: 'code', reason: 'Code cannot be empty' });
    }
    if (!language) {
        errors.push({ field: 'language', reason: 'Programming language must be specified' });
    }

    if (errors.length > 0) {
        return problem(res, 422, 'validation-failed', 'Your submission is invalid.', 'One or more fields failed validation.', { errors });
    }
    next();
}

// C3 & C4: Content Negotiation Helper
function sendResponse(req, res, status, data) {
    const accept = req.get('Accept') || 'application/json';
    
    if (accept.includes('application/xml')) {
        res.status(status).set('Content-Type', 'application/xml; charset=utf-8');
        return res.send(js2xmlparser.parse('response', data));
    } else if (accept.includes('application/json') || accept.includes('*/*')) {
        res.status(status).set('Content-Type', 'application/json; charset=utf-8');
        return res.json(data);
    } else {
        return problem(res, 406, 'not-acceptable', 'Format Not Acceptable', 'Only application/json or application/xml are supported.');
    }
}

// POST /submissions (A3: Set Location, A1: Map outcomes)
app.post('/submissions', validateSubmission, async (req, res) => {
    try {
        // Simulate sending to external coding platform
        const newId = `sub_${Math.random().toString(36).substr(2, 9)}`;
        
        // A3: Set Location on create
        res.set('Location', `/submissions/${newId}`);
        sendResponse(req, res, 201, { id: newId, status: 'queued', ...req.body });
    } catch (err) {
        // B4: Don't leak internals
        console.error("DB_ERROR:", err.stack);
        problem(res, 502, 'platform-unreachable', 'Platform Offline', 'The target coding platform is currently unreachable. Please try again later.');
    }
});

// GET /submissions/:id
app.get('/submissions/:id', (req, res) => {
    const id = req.params.id;
    if (id !== 'sub_valid123') {
        return problem(res, 404, 'submission-not-found', 'Submission Not Found', `No submission found with id ${id}`);
    }
    sendResponse(req, res, 200, { id, status: 'accepted', memory: '24MB', runtime: '45ms' });
});

// A4: Retry-safety (Rate limiting simulation)
app.get('/rate-limit-test', (req, res) => {
    res.set('Retry-After', '60');
    problem(res, 429, 'too-many-requests', 'Rate Limit Exceeded', 'You have made too many API calls to Codeforces.');
});

app.listen(3000, () => console.log('Coding Hub API running'));