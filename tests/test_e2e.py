import server

class DummyResp:
    def __init__(self, status=200, ok=True, json_data=None, text=''):
        self.status_code = status
        self.ok = ok
        self._json = json_data or {}
        self.text = text
    def json(self):
        return self._json


def test_generate_unconfigured(client, monkeypatch):
    monkeypatch.setattr(server, 'TL_API_BASE', None)
    resp = client.post('/generate', json={'prompt': 'test'})
    assert resp.status_code == 500


def test_generate_proxies_upstream(client, monkeypatch):
    def fake_post(url, json=None, timeout=None):
        return DummyResp(status=200, ok=True, json_data={'text': 'Sample answer from upstream'})

    monkeypatch.setattr(server.requests, 'post', fake_post)

    resp = client.post('/generate', json={'prompt': 'hello'})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data.get('text') == 'Sample answer from upstream'
